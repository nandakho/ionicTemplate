import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MiscService } from 'src/app/services/misc.service';
import { DbService } from 'src/app/services/db.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConfigService } from 'src/app/services/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  isLoggedIn: boolean;
  username: string;
  password: string;
  currYear: number = new Date().getFullYear();
  public loginForm: FormGroup;
  isActiveToggleTextPassword: Boolean = true;
  animRdy: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private misc: MiscService,
    private db: DbService,
    private auth: AuthService,
    private config: ConfigService,
  ){}

  ngOnInit() {
    this.loginForm = this.formBuilder.group({});
  }

  ionViewDidEnter(){
    setTimeout(()=> {
      this.animRdy=true;
    }, 100);
  }

  savedUser(){
    this.config.readConfig('currentUser').then(resp=>{
      console.log(resp);
    }).catch(err=>{
      console.log(err);
    });
    /* 
    if(currentUser){
      var datenow = Date.now();
      var daypassed = Math.round(Math.abs(datenow-resp.login))/(24 * 60 * 60 * 1000);
      if(daypassed>1){
        this.misc.showToast("Login expired - Silahkan login kembali");
        this.isLoggedIn=false;
        this.auth.logout();
      } else {
        this.username=resp['username'];
        this.isLoggedIn=true;
      }
    } */
  }

  loginUser(formlogin){
    console.log(formlogin.value);
    this.auth.login(formlogin.value);
  }

  logout(){
    this.isLoggedIn=false;
    this.username="";
    this.auth.logout();
  }

  public toggleTextPassword(): void{
    this.isActiveToggleTextPassword = (this.isActiveToggleTextPassword==true)?false:true;
  }

  public getType() {
    return this.isActiveToggleTextPassword ? 'password' : 'text';
  }
}
