import { Injectable } from '@angular/core';
import { ToastController, ModalController } from '@ionic/angular';
import { CameraComponent, picWM } from '../components/camera/camera.component';
import { File } from '@awesome-cordova-plugins/file/ngx';

@Injectable({
  providedIn: 'root'
})
export class MiscService {
  camActive: boolean = false;

  constructor(
    private toast: ToastController,
    private modal: ModalController,
    private file: File
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
      this.file.writeFile(this.file.externalDataDirectory,this.generateName(),this.b64toBlob(imageData,"image/jpeg")).then(()=>{
        resolve(true);
      }).catch((err)=>{
        reject(err);
      });
    });
    return promise;
  }

  b64toBlob(b64Data, contentType='', sliceSize=512){
    const byteCharacters = atob(b64Data);
    const byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const blob = new Blob(byteArrays, {type: contentType});
    return blob;
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

  openCam(opt:picWM){
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
          this.writeImage(dataURL[1]);
          resolve(dataURL);
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
