import { Component, OnInit } from '@angular/core';
import { AuthService, ApiService, DbService, MiscService } from 'src/app/services';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.page.html',
  styleUrls: ['./sync.page.scss'],
})
export class SyncPage implements OnInit {
  syncList: whatSync[] = [
    { title: "User", role: [this.auth.role[0]], syncTarget:["user"] }
  ];
  progress: progressBar[] = [];
  progressShow: boolean = false;
  constructor(
    private auth: AuthService,
    private api: ApiService,
    private db: DbService,
    private misc: MiscService
  ) { }

  ngOnInit() {
    this.progressShow = false;
    this.api.apiRefresh.next(true);
  }
  
  ionViewDidLeave(){
    this.api.apiRefresh.next(false);
  }

  startProgress(what:string[]): void{
    this.progress = [];
    for(let i = 0;i<what.length;i++){
      this.progress.push({what:what[i],progress:0,total:0,berhasil:0});
    }
    this.progressShow = true;
  }

  async syncStart(syncTarget:string[]){
    this.misc.onSync = true;
    this.startProgress(syncTarget);
    for(let i = 0;i<syncTarget.length;i++){
      try {
        await this.sync(syncTarget[i],i);
        await this.misc.showToast("Sinkronisasi database "+syncTarget[i]+" berhasil!");
      } catch (err) {
        this.misc.showToast(err);
      }
    }
    await this.misc.showToast("Proses sinkronisasi selesai!");
    this.misc.onSync = false;
  }

  async sync(target,dbNo): Promise<void> {
    var errCount = 0;
    this.progress[dbNo].syncing = true;
    this.progress[dbNo].progress = 0;
    this.progress[dbNo].berhasil = 0;
    this.progress[dbNo].total = 0;
    try {
      const resp = await this.api.syncSomething(target);
      if(resp.status.toString()[0]!="2"){
        this.progress[dbNo].total = 1;
        this.progress[dbNo].progress = 1;
        this.progress[dbNo].berhasil = 0;
        this.progress[dbNo].syncing = false;
        this.progress[dbNo].success = false;
        return Promise.reject("Sinkronisasi database "+target+" gagal:<br>Error: "+resp.data.error);
      }
      this.progress[dbNo].total = resp.data.length;
      await this.db.purge({from:target});
      for(let i = 0;i<resp.data.length;i++){
        const dKey:string[] = Object.keys(resp.data[i]);
        const dVal:string[] = Object.values(resp.data[i]);
        try {
          await this.db.insert({into:target,column:dKey,values:dVal});
          this.progress[dbNo].berhasil++;
        } catch (err) {
          errCount++;
        }
        this.progress[dbNo].progress++;
      }
      if(errCount==0){
        this.progress[dbNo].syncing = false;
        this.progress[dbNo].success = true;
        return Promise.resolve();
      } else {
        this.progress[dbNo].syncing = false;
        this.progress[dbNo].success = false;
        return Promise.reject("Sinkronisasi database "+target+" gagal!<br>Error: Gagal menulis ke database!");
      }
    } catch (err) {
      this.progress[dbNo].total = 1;
      this.progress[dbNo].progress = 1;
      this.progress[dbNo].syncing = false;
      this.progress[dbNo].success = false;
      return Promise.reject(err);
    }
  }
}

interface whatSync {
  title: string;
  role: (string|boolean)[];
  syncTarget: string[];
}

interface progressBar {
  what: string;
  total?: number;
  progress?: number;
  success?: boolean;
  berhasil?: number;
  syncing?: boolean
}