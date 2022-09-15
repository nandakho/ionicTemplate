import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MiscService } from 'src/app/services/misc.service';
import { AuthService } from 'src/app/services/auth.service';
import { DbService } from 'src/app/services/db.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username: string;
  password: string;
  currYear: number = new Date().getFullYear();
  public loginForm: FormGroup;
  isActiveToggleTextPassword: Boolean = true;
  animRdy: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private misc: MiscService,
    private auth: AuthService,
    private db: DbService
  ){}

  async ngOnInit() {
    this.loginForm = this.formBuilder.group({});
    const savedUser = await this.auth.savedUser();
    if(savedUser.logStatus=="expired"){
      this.misc.showToast("Login expired - Silahkan login kembali");
    }
    if(savedUser.logStatus=="ok"){
      this.username = savedUser.username;
    }
  }

  ionViewDidEnter(){
    setTimeout(()=> {
      this.animRdy=true;
    }, 100);
  }

  async loginUser(formlogin){
    if(await this.auth.login(formlogin.value)){
      this.misc.goTo('home',"root");
    } else {
      this.misc.showToast("Username atau Password salah!");
    };
  }

  public toggleTextPassword(): void{
    this.isActiveToggleTextPassword = (this.isActiveToggleTextPassword==true)?false:true;
  }

  public getType() {
    return this.isActiveToggleTextPassword ? 'password' : 'text';
  }
}
