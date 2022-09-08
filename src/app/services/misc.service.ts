import { Injectable } from '@angular/core';
import { ToastController, ModalController } from '@ionic/angular';
import { CameraComponent, picOpt } from '../components/camera/camera.component';
import { Filesystem, Directory } from '@capacitor/filesystem';

@Injectable({
  providedIn: 'root'
})
export class MiscService {
  camActive: boolean = false;

  constructor(
    private toast: ToastController,
    private modal: ModalController
  ) { }

  generateName(){
    var date = new Date().toISOString();
    var name = date.replace(/:|-|\.|Z|T/g,"") + ".jpeg";
    return name;
  }
  
  curTimestamp(){
    var now = new Date(Date.now());
    if(now.getDate()<10){
      var now_date = "0" + String(now.getDate());
    } else {
      var now_date = String(now.getDate());
    }
    var month = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    var now_month = month[now.getMonth()];
    var now_year = now.getFullYear();
    if(now.getHours()<10){
      var now_hour = "0" + String(now.getHours());
    } else {
      var now_hour = String(now.getHours());
    }
    if(now.getMinutes()<10){
      var now_min = "0" + String(now.getMinutes());
    } else {
      var now_min = String(now.getMinutes());
    }
    if(now.getSeconds()<10){
      var now_sec = "0" + String(now.getSeconds());
    } else {
      var now_sec = String(now.getSeconds());
    }
    return now_date + " " + now_month + " " + now_year + ", " + now_hour + ":" + now_min + ":" + now_sec;
  }

  writeImage(imageData){
    var promise = new Promise((resolve,reject)=>{
      Filesystem.writeFile({
        path: 'ready/'+this.generateName(),
        data: imageData,
        directory: Directory.External,
        recursive: true
      }).then((uri)=>{
        resolve(uri);
      }).catch((err)=>{
        reject(err);
      });
    });
    return promise;
  }

  showToast(message:string,duration:number=2000){
    var allToast = document.querySelectorAll('ion-toast');
    if(allToast.length>0){
      var prevHeight = allToast.item(allToast.length-1).shadowRoot.children.item(0).getBoundingClientRect().height;
      for (let index = 0; index < allToast.length; index++) {
        const element = allToast.item(index).getBoundingClientRect();
        allToast.item(index).style.position = "fixed";
        allToast.item(index).style.top = String(element.top-(prevHeight)-2)+"px";
      }
    }
    this.toast.create({message:message,duration:duration}).then(newToast=>{
      newToast.present().then(()=>{
        var newHeight = newToast.shadowRoot.children.item(0).getBoundingClientRect().height;
        if(newHeight!=prevHeight){
          for (let index = 0; index < allToast.length; index++) {
            const element = allToast.item(index).getBoundingClientRect();
            allToast.item(index).style.position = "fixed";
            allToast.item(index).style.top = String(element.top-(Math.abs(newHeight-prevHeight)))+"px";
          }
        }
      });
    });
  }

  openCam(opt:picOpt){
    var promise = new Promise(async (resolve,reject)=>{
      const modal = await this.modal.create({
        component: CameraComponent,
        animated: true,
        backdropDismiss: false,
        componentProps: {option: opt}
      });
      modal.onDidDismiss().then((data) => {
        if (data.data) {
          var dataURL = data.data.split(",");
          this.writeImage(dataURL[1]).then(uri=>{
            if(opt.returnType=="Base64"){
              resolve(data.data);
            } else {
              resolve(uri);
            }
          }).catch(err=>{
            reject(err);
          });
        } else {
          reject("Dibatalkan");
        }
        this.camActive = false;
      });
      return await modal.present();
    });
    return promise;
  }
}
