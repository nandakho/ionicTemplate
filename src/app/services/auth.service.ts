import { Injectable } from '@angular/core';
import { SHA1 } from 'crypto-js';
import { ConfigService } from './config.service';
import { DbService } from './db.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isLoggedIn: boolean = false;
  public loggedUser: currentUser;
  public role: string[] = ['admin'];
  constructor(
    private config: ConfigService,
    private db: DbService
  ) { }
  
  saltedPass(pass:string):string{
    return SHA1(pass+pass).toString();
  }

  sanitize(string:string):string{
    //sanitize quotes
    const sanitized = string.replace(/["\s]/g, '$&$&');
    return sanitized;
  }

  async login(form:loginForm):Promise<boolean>{
    const username = this.sanitize(form.username);
    const password = this.saltedPass(form.password);
    //admin default pass 'admin'
    if(username == "admin" && password=="dd94709528bb1c83d08f3088d4043f4742891f4f"){
      this.loggedUser = {
        username: username,
        password: password,
        role: this.role[0],
        unit: ['ALL'],
        loginTime: Date.now()
      };
    } else {
      const where = `username="${username}" AND password="${password}"`;
      const usrFound = await this.db.select({what:["*"],from:'users',where:where,orderby:"username",orderdir:"ASC"});
      if(usrFound.length<1){
        return Promise.resolve(false);
      } else {
        this.loggedUser = {
          username: usrFound[0].username,
          password: usrFound[0].password,
          role: this.role[usrFound[0].role],
          unit: usrFound[0].unit.split(","),
          loginTime: Date.now()
        }
      }
    }
    if(await this.config.writeConfig("currentUser",this.loggedUser)){
      this.isLoggedIn = true;
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async savedUser():Promise<loggedUser>{
    const loggedUser = await this.config.readConfig('currentUser');
    if(loggedUser){
      var datenow = Date.now();
      var daypassed = Math.round(Math.abs(datenow-loggedUser['loginTime']))/(24 * 60 * 60 * 1000);
      if(daypassed>1){
        await this.logout();
        return Promise.resolve({logStatus:"expired"});
      } else {
        this.isLoggedIn=true;
        this.loggedUser = {
          username:loggedUser['username'],
          password:loggedUser['password'],
          role:loggedUser['role'],
          unit:loggedUser['unit'],
          loginTime:loggedUser['loginTime']
        }
        return Promise.resolve({logStatus:"ok",username:loggedUser['username']});
      }
    }
    return Promise.resolve({logStatus:"not_login"});
  }

  async logout():Promise<void>{
    if(await this.config.deleteConfig("currentUser")){
      this.isLoggedIn = false;
      return Promise.resolve();
    }
    return Promise.reject();
  }
}

export interface loggedUser {
  logStatus: "not_login"|"ok"|"expired";
  username?: string;
}

export interface loginForm{
  username: string;
  password: string;
}

export interface currentUser{
  username: string;
  password: string;
  role: string;
  unit: string[];
  loginTime: number;
}
