import { Injectable } from '@angular/core';
import { SHA1 } from 'crypto-js';
import { ConfigService } from './config.service';
import { DbService, selectOption } from './db.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isLogin: boolean;
  public loggedUser: currentUser;
  public role: string[] = ['admin']
  constructor(
    private config: ConfigService,
    private db: DbService
  ) { }
  
  saltedPass(pass:string){
    return SHA1(pass+pass).toString();
  }

  login(form:loginForm){
    var username = form.username;
    var password = this.saltedPass(form.password);
    //admin default pass 'admin'
    if(username == 'admin' && password=="dd94709528bb1c83d08f3088d4043f4742891f4f"){
      this.loggedUser = {
        username: username,
        password: this.saltedPass(password),
        role: this.role[0],
        unit: ['ALL'],
        login: Date.now()
      };
      var where = "username='test' AND password='test'";
      this.db.select({what:["*"],from:'users',where:where,orderby:"username",orderdir:"ASC"}).then(result=>{
        console.log(result);
      }).catch(err=>{
        console.log(err);
      });
    }
  }

  logout(){
    
  }
}

export interface loginForm{
  username: string;
  password: string;
}

export interface currentUser{
  username: string;
  password: string;
  role: string;
  unit?: string[];
  login: number;
}
