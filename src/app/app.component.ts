import { Component } from '@angular/core';
import { DbService } from './services/db.service';
import { AuthService } from './services/auth.service';
import { MiscService } from './services/misc.service';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(public db: DbService, public auth: AuthService, public misc: MiscService) {
    if(!this.db.initDone){
      this.db.init();
    }
    this.auth.savedUser().then(async savedUser=>{
      if(savedUser.logStatus=="expired"){
        await this.misc.goTo("","root");
        this.misc.showToast("Login expired - Silahkan login kembali");
      }
    });
  }
}