import { Component, OnInit } from '@angular/core';
import { MiscService } from 'src/app/services/misc.service';
import { ConfigService } from 'src/app/services/config.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  listConfig:configRole = {
    camera: [false]
  }
  cameraOption = {
    timestamp:true,
    location:false,
    quality:75
  }

  constructor(
    private misc: MiscService,
    private config: ConfigService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.readCamConfig();
  }

  //CAM CONFIG
    async readCamConfig(){
      const conf = await this.config.readConfig('camera');
      if(conf){
        this.cameraOption = {
          timestamp:conf['timestamp'],
          location:conf['location'],
          quality:conf['quality']
        };
      }
    }

    async saveCam(form){
      try {
        await this.config.writeConfig('camera',{timestamp:form.value.timestamp,location:form.value.location,quality:form.value.quality});
        this.misc.showToast("Pengaturan kamera disimpan!");
      } catch (err) {
        this.misc.showToast(err); 
      }
    }
}

interface configRole {
  [key: string]: (string|boolean)[];
}