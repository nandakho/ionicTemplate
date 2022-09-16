import { Component } from '@angular/core';
import { DbService } from './services/db.service';
import { AuthService } from './services/auth.service';
import { MiscService } from './services/misc.service';
import { App } from '@capacitor/app';
import { NavController, Platform, AlertController } from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(public alertController: AlertController, public nav: NavController, public pf: Platform, public db: DbService, public auth: AuthService, public misc: MiscService) {
    this.init();
  }

  async init(){
    await this.pf.ready();
    if(!this.db.initDone){
      this.db.init();
    }
    const savedUser = await this.auth.savedUser();
    if(savedUser.logStatus=="expired"||savedUser.logStatus=="not_login"){
      await this.misc.goTo("","root");
      this.misc.showToast("Login expired - Silahkan login kembali");
    }
    this.backSubs();
  }

  backSubs(){
    var exitLoc = ['/login','/home','']
    App.removeAllListeners().then(()=>{
      App.addListener("backButton",this.misc.backSubs = () => {
        if(!this.misc.camActive){
          if(exitLoc.includes(location.pathname)){
            this.exitConfirm();
          } else {
            this.nav.back();
          }
        }
      });
    });
  }

  async exitConfirm(){
    const alert = await this.alertController.create({
      header: "Konfirmasi",
      message: "Tutup Aplikasi?",
      buttons: [{
        text: 'Tutup',
        handler: () => {
          navigator['app'].exitApp();
        }
      }, {
        text: 'Batal'
      }]
    });
    
    await alert.present();
  }
}