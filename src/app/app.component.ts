import { Component } from '@angular/core';
import { DbService } from './services/db.service';
import { AuthService } from './services/auth.service';
import { MiscService } from './services/misc.service';
import { ConfigService } from './services/config.service';
import { App } from '@capacitor/app';
import { NavController, Platform, AlertController } from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    public alertController: AlertController,
    public nav: NavController,
    public pf: Platform,
    public db: DbService,
    public auth: AuthService,
    public misc: MiscService,
    public config: ConfigService
  ) {
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
      if(savedUser.logStatus=="expired"){
        this.misc.showToast("Login expired - Silahkan login kembali");
      }
    }
    this.backSubs();
    this.geoSubs();
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

  geoSubs(){
    this.misc.geoSubs.subscribe(active=>{
      if(active){
        this.misc.geoSubsId = navigator.geolocation.watchPosition(loc=>{
          this.misc.geoLoc = {
            lat: loc.coords.latitude,
            long: loc.coords.longitude
          }
        },err=>{
          console.log(err);
        },{enableHighAccuracy:true});
      } else {
        navigator.geolocation.clearWatch(this.misc.geoSubsId);
      }
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