import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MiscService } from '../../services/misc.service';
import { DbService } from 'src/app/services/db.service';

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
    this.misc.openCam("Base64").then(res=>{
      this.img = res; //for testing
    }).catch((err)=>{
      this.misc.showToast(err);
    });
  }
}
