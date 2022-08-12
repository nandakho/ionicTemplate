import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Toast } from '@capacitor/toast';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
})
export class FolderPage implements OnInit {
  public folder: string;

  constructor(private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id');
  }
  
  toast(){
    Toast.show({text:this.folder+" shown!"});
  }
}
