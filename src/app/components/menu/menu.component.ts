import { Component, OnInit, Input } from '@angular/core';
import { NavController, MenuController, Platform } from '@ionic/angular';
import { DbService } from 'src/app/services/db.service';
import { AuthService } from 'src/app/services/auth.service';
import { MiscService } from 'src/app/services/misc.service';
@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  @Input() indicator: boolean;
  menuTitle: string;
  menuIcon: string;
  user: string;
  role: string;
  unit: string;
  //list pages yang masuk menu
  pages:pageMenu[][] = [
    [
      { title: 'Halaman Utama', icon: 'home', path: '/home', role: [false] }
    ],
    [
      { title: 'Camera', icon: 'document', path: '/folder/Inbox', role: [false] }
    ]
  ]

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
  }

  async checkUser(){
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

  checkPage():void{
    const loc = location.pathname;
    for (let i = 0; i<this.pages.length; i++){
      for (let ii = 0; ii<this.pages[i].length; ii++){
        if(this.pages[i][ii].path==loc){
          this.menuTitle = this.pages[i][ii].title;
          this.menuIcon = this.pages[i][ii].icon;
          return;
        }
      }
    }
  }

  async moveTo(destination){
    await this.menuCtrl.close().then(async ()=>{
      await this.navCtrl.navigateRoot(destination);
    });
  }

  async openMenu(){
    await this.menuCtrl.open();
  }

  async closeMenu(){
    await this.menuCtrl.close();
  }

  async logout(){
    await this.auth.logout();
    await this.navCtrl.navigateRoot('/login');
    this.misc.showToast("Anda telah logout!");
  }
}

interface pageMenu {
  title: string;
  icon: string;
  path: string;
  role?: (string|boolean)[];
}