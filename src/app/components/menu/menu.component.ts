import { Component, OnInit, Input } from '@angular/core';
import { NavController, MenuController, Platform } from '@ionic/angular';
import { DbService, AuthService, MiscService, pageMenu } from 'src/app/services';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  @Input() indicator: number;
  menuTitle: string;
  menuIcon: string;
  user: string;
  role: string;
  unit: string;
  pages:pageMenu[][] = this.auth.pages;
  userMenu:pageMenu[][] = [[],[],[]];

  constructor(
    private pf: Platform,
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private db: DbService,
    private auth: AuthService,
    private misc: MiscService
  ){}

  async ngOnInit() {
    await this.pf.ready();
    await this.checkUser();
    this.checkPage();
    this.checkWhatMenu();
  }

  async checkUser(): Promise<void>{
    if(this.auth.isLoggedIn){
      this.user = this.auth.loggedUser.username;
      this.role = this.auth.loggedUser.role;
      this.unit = this.auth.loggedUser.unit.join(" ");
      return Promise.resolve();
    } else {
      if((await this.auth.savedUser()).logStatus=="ok"){
        this.user = this.auth.loggedUser.username;
        this.role = this.auth.loggedUser.role;
        this.unit = this.auth.loggedUser.unit.join(" ");
        return Promise.resolve();
      }
    }
  }

  checkWhatMenu(): void{
    for(let i = 0;i<this.pages.length;i++){
      for(let ii = 0;ii<this.pages[i].length;ii++){
        if(this.pages[i][ii].role.includes(this.role)||this.pages[i][ii].role[0]==false){
          this.userMenu[i].push(this.pages[i][ii]);
        }
      }
    }
    for(let i = 0;i<this.userMenu.length;i++){
      if(this.userMenu[i].length==0){
        this.userMenu.splice(i,1);
      }
    }
  }

  checkPage():void{
    const loc = location.pathname;
    for (let i = 0; i<this.pages.length; i++){
      for (let ii = 0; ii<this.pages[i].length; ii++){
        if(this.pages[i][ii].path.split("/")[1]==loc.split("/")[1]){
          this.menuTitle = this.pages[i][ii].title;
          this.menuIcon = this.pages[i][ii].icon;
          return;
        }
      }
    }
  }

  async moveTo(destination){
    if(this.misc.onSync){
      this.misc.showToast("Harap menunggu proses sinkronisasi selesai!");
      return;
    }
    if(destination.split("/")[1]!=location.pathname.split("/")[1]){
      await this.menuCtrl.close().then(async ()=>{
        await this.navCtrl.navigateRoot(destination);
      });
    }
  }

  async openMenu(){
    await this.menuCtrl.open();
  }

  async closeMenu(){
    await this.menuCtrl.close();
  }

  async logout(){
    if(this.misc.onSync){
      this.misc.showToast("Harap menunggu proses sinkronisasi selesai!");
      return;
    }
    await this.auth.logout();
    await this.navCtrl.navigateRoot('/login');
    this.misc.showToast("Anda telah logout!");
  }
}