import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MiscService } from '../services/misc.service';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;
  private count: string="";
  img;

  constructor(
    private activatedRoute: ActivatedRoute,
    private misc: MiscService
  ) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
  }

  toast(){
    this.count+="@@@@@ @@@@@ ";
    this.misc.showToast(this.count+" "+this.folder+" shown.");
  }

  openCam(){
    this.misc.openCam({time:true,coord:false}).then(res=>{
      console.log(res);
      this.img = res;
    });
  }
}
