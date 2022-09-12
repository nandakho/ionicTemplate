import { Injectable } from '@angular/core';
import { SHA1 } from 'crypto-js';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isLogin: boolean;
  public loggedUser: currentUser;

  constructor(private config: ConfigService) {
    this.init();
  }
  
  init(){
    this.config.checkLogin().then(y=>{
      console.log(y);
    }).catch(e=>{
      console.log(e);
    });
  }

  saltedPass(pass:string){
    return SHA1(pass+pass).toString();
  }

  login(form:loginForm){
    var username = form.user;
    var password = this.saltedPass(form.pass);
    //admin default pass 'admin'
    if(username == 'admin' && password=="dd94709528bb1c83d08f3088d4043f4742891f4f"){
      this.loggedUser = {
        username: username,
        password: password,
        role: 'admin',
        login: Date.now()
      };
      /* this.db.removeUser().then(()=>{
        this.db.writeUser(dataUser).then(()=>{
          this.authState.next(true);
          this.misc.navCtrl.navigateRoot('/home');
        });
      }).catch(err=>{
        this.misc.showToast(err);
      }); */
    } else {

      /* this.db.removeUser().then(()=>{
        this.db.loginUser(username,password).then(ah=>{
          if(ah['GRANTED']==1){
            var dataUser = {
              username: username,
              password: password,
              unit: ah['unit'],
              auth: ah['auth'],
              login: Date.now()
            };
            this.db.writeUser(dataUser).then(()=>{
              this.authState.next(true);
              this.misc.navCtrl.navigateRoot('/home');
            });
          } else {
            this.misc.showToast('Username atau Password salah!');
          }
        });
      }).catch(err=>{
        this.misc.showToast(err);
      }); */
    }
  }

  logout(){
    /* this.db.removeUser().then(()=>{
      this.authState.next(false);
      this.misc.navCtrl.navigateRoot('/login');
      this.misc.bgGPSSrv=false;
      this.misc.userNeedGPS = false;
    }); */
  }
}

export interface loginForm{
  user: string;
  pass: string;
}

export interface currentUser{
  username: string;
  password: string;
  role: string;
  unit?: string[];
  login: number;
}
