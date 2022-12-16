import { Component, OnInit } from '@angular/core';
import { MiscService, ConfigService, ApiService, AuthService } from 'src/app/services';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.page.html',
  styleUrls: ['./setting.page.scss'],
})
export class SettingPage implements OnInit {
  addr: string;
  apiTesting: boolean = false;
  listConfig:configRole = {
    camera: [false],
    ip: ['admin']
  }
  cameraOption = {
    timestamp:true,
    location:false,
    quality:75
  }

  constructor(
    private misc: MiscService,
    private config: ConfigService,
    private api: ApiService,
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.readIPConfig();
    this.readCamConfig();
  }

  //IP CONFIG
    async readIPConfig(){
      const addr = await this.config.readConfig('apiAddress');
      if(addr){
        this.api.apiAddr = addr['address'];
      }
      this.apiTesting = false;
    }

    async saveIP(form){
      this.apiTesting = true;
      try {
        const resp = await this.api.connectTest(form.value.addr);
        this.apiTesting = false;
        if(resp){
          if(await this.config.writeConfig('apiAddress',{address:form.value.addr})){
            this.api.apiAddr = form.value.addr;
            this.misc.showToast("Alamat Server berhasil diubah!");
          } else {
            this.misc.showToast("Gagal menyimpan perubahan");
          }
        }
      } catch (err) {
        this.apiTesting = false;
        this.misc.showToast(err); 
      }
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