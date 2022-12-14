import { Component } from '@angular/core';
import { DbService, AuthService, MiscService, ApiService, ConfigService } from './services';
import { App } from '@capacitor/app';
import { NavController, Platform, AlertController } from '@ionic/angular';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  needApiCheck: boolean = false;
  constructor(
    public alertController: AlertController,
    public nav: NavController,
    public pf: Platform,
    public db: DbService,
    public auth: AuthService,
    public misc: MiscService,
    public api: ApiService,
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
    this.apiSubs();
    this.geoSubs();
    this.themeSubs();
    setTimeout(() => {
      this.misc.backSubs.next(true);
    },1000);
  }

  async apiSubs(){
    this.api.apiRefresh.subscribe(async active =>{
      if(active){
        this.needApiCheck = true;
        var ipaddr = this.api.apiAddr;
        const addr = await this.config.readConfig('apiAddress');
        if (addr){
          ipaddr = addr['address'];
        }
        this.apiCheck(ipaddr);
      } else {
        this.needApiCheck = false;
      }
    });
  }

  async apiCheck(ip){
    const interval = 5000;
    if(this.needApiCheck){
      try {
        await this.api.connectTest(ip);
        this.api.apiConnected = 1;
      } catch (err) {
        this.api.apiConnected = 0;
      }
      setTimeout(() => {
        this.apiCheck(ip);
      }, interval);
    }
  }

  backSubs(){
    var exitLoc = ['/login','/home',''];
    this.misc.backSubs.subscribe(async active => {
      if(active){
        await App.removeAllListeners().then(async ()=>{
          await App.addListener("backButton",() => {
            if(this.misc.onSync){
              this.misc.showToast("Harap menunggu proses sinkronisasi selesai!");
              return;
            }
            if(exitLoc.includes(location.pathname)){
              this.exitConfirm();
            } else {
              this.nav.back();
            }
          });
        });
      } else {
        await App.removeAllListeners();
      }
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

  themeSubs(){
    if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.misc.darkTheme = true;
    }
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      this.misc.darkTheme = event.matches;
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