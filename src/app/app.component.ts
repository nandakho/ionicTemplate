import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public user = 'Nama User';
  public role = 'tes'
  public app = {
    header: this.user,
    sub_header: "Notes",
    pages:[
      { title: 'Inbox', url: '/folder/Inbox', icon: 'mail', auth:['tas','tis'] },
      { title: 'Outbox', url: '/folder/Outbox', icon: 'paper-plane', auth:['tus'] },
      { title: 'Favorites', url: '/folder/Favorites', icon: 'heart', auth:['tes'] },
      { title: 'Archived', url: '/folder/Archived', icon: 'archive', auth:['tos'] },
      { title: 'Trash', url: '/folder/Trash', icon: 'trash', auth:[false] },
      { title: 'Spam', url: '/folder/Spam', icon: 'warning', auth:[false] },
    ]
  };
  constructor() {}
}