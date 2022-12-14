import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DbService, MiscService } from 'src/app/services';

@Component({
  selector: 'app-dev',
  templateUrl: './dev.page.html',
  styleUrls: ['./dev.page.scss'],
})
export class DevPage implements OnInit {
  public folder: string;
  private count: string="";
  private qForm = {
    what: "",
    from: "",
    where: "",
    manual: ""
  };
  img;

  constructor(
    private activatedRoute: ActivatedRoute,
    private misc: MiscService,
    private db: DbService
  ) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
  }

  toast(){
    this.count+="@ ";
    this.misc.showToast(this.count+" "+this.folder+" shown.");
  }

  async testQuery(form){
    const q = form.value;
    if(q.manual){
      try {
        const result = await this.db.sql.query(q.manual);
        console.log(result);
      } catch (err) {
        this.misc.showToast(err);
      }
    } else {
      try {
        const result = await this.db.select({what:q.what.split(","),from:q.from,where:q.where});
        console.log(result);
      } catch (err) {
        this.misc.showToast(err);
      }
    }
  }

  openCam(){
    this.misc.camActive = true;
    this.misc.backSubs.next(false);
    this.misc.openCam("Base64").then(res=>{
      this.img = res; //for testing
    }).catch((err)=>{
      this.misc.showToast(err);
    }).finally(()=>{
      this.misc.camActive = false;
      this.misc.backSubs.next(true);
    });
  }
}
