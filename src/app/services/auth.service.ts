import { Injectable } from '@angular/core';
import { SHA1 } from 'crypto-js';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public isLogin: boolean;
  public loggedUser: currentUser;

  constructor(private config: ConfigService) { }
  
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
        password: password,
        role: 'admin',
        login: Date.now()
      };
      this.config.writeConfig('currentUser',this.loggedUser.username).then(()=>{
        this.isLogin = true;
        //navigate
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
