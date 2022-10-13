import { Injectable } from '@angular/core';
import { ToastController, ModalController, NavController } from '@ionic/angular';
import { CameraComponent, picOpt } from '../components/camera/camera.component';
import { Directory, Filesystem, WriteFileResult } from '@capacitor/filesystem';
import { ConfigService } from './config.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MiscService {
  camActive: boolean = false;
  backSubs;
  geoSubs: BehaviorSubject<boolean> = new BehaviorSubject(false);
  geoSubsId: number;
  geoLoc: loc;

  constructor(
    private toast: ToastController,
    private modal: ModalController,
    private nav: NavController,
    private config: ConfigService
  ) { }

  /**
   * Generate string of image name based on timestamp
   * @returns string
   */
  generateName():string{
    var date = new Date().toISOString();
    var name = date.replace(/:|-|\.|Z|T/g,"") + ".jpeg";
    return name;
  }
  
  /**
   * Generate string of timestamp
   * @returns string
   */
  curTimestamp():string{
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

  /**
   * Returns string of cached location
   * @returns string
   */
   curLocation(): string {
    const decimal = 5;
    const divider = Math.pow(10,decimal);
    if(!this.geoLoc){
      return "";
    }
    if(this.geoLoc.lat<0){
      var lat_dir = "S";
      var lat_cord = Math.floor(this.geoLoc.lat*(-divider))/divider;
    } else {
      var lat_dir = "N";
      var lat_cord = Math.floor(this.geoLoc.lat*divider)/divider;
    }
    if(this.geoLoc.long<0){
      var long_dir = "W";
      var long_cord = Math.floor(this.geoLoc.long*(-divider))/divider;
    } else {
      var long_dir = "E";
      var long_cord = Math.floor(this.geoLoc.long*divider)/divider;
    }
    return lat_cord+lat_dir+"  "+long_cord+long_dir;
  }

  /**
   * Write Image to External storage
   * file:///storage/emulated/0/Android/Data/packageName/files/targetFolder
   * @param imageData 
   * @param targetFolder 
   * @returns Promise<WriteFileResult>
   */
  async writeImage(imageData,targetFolder=""):Promise<WriteFileResult>{
    try {
      const uri = Filesystem.writeFile({
        path: targetFolder+this.generateName(),
        directory: Directory.External,
        data: imageData,
        recursive: true
      });
      return Promise.resolve(uri);
    } catch(err) {
      return Promise.reject(new Error(err));
    }
  }

  /**
   * Navigation..
   * @param page 
   * @param direction 
   * @returns Promise<void>
   */
  async goTo(page:string,direction:"root"|"forward"|"backward"="forward"):Promise<void>{
    try {
      switch(direction){
        case "root":
          await this.nav.navigateRoot(page);
          break;
        case "forward":
          await this.nav.navigateForward(page);
          break;
        case "backward":
          await this.nav.navigateBack(page);
          break;
      }
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  /**
   * Show toast, automatically push existing toast up if another toast is called
   * @param message 
   * @param duration 
   */
   async showToast(message:string,duration:number=3000):Promise<void>{
    var allToast = document.querySelectorAll('ion-toast');
    const newToast = await this.toast.create({message:message,duration:duration});
    await newToast.present();
    var newHeight = newToast.shadowRoot.children.item(0).getBoundingClientRect().height;
    if(allToast.length>0){
      for (let index = 0; index < allToast.length; index++) {
        const element = allToast.item(index).getBoundingClientRect();
        allToast.item(index).style.position = "fixed";
        allToast.item(index).style.top = String(element.top-(newHeight)-2)+"px";
      }
    }
    newToast.style.opacity = "100%";
    return Promise.resolve();
  }

  /**
   * Open camera preview, returning either file uri or base64 string
   * @param opt 
   * @param targetFolder 
   * @returns string|WriteFileResult
   */
   async openCam(returnType,targetFolder=""){
    const defOpt:picOpt = await this.config.readConfig("camera") ?? { timestamp:true, location:false, quality:75 };
    var promise = new Promise(async (resolve,reject)=>{
      const modal = await this.modal.create({
        component: CameraComponent,
        animated: true,
        backdropDismiss: false,
        componentProps: {option: defOpt}
      });
      modal.onDidDismiss().then((data) => {
        if (data.data) {
          var dataURL = data.data.split(",");
          this.writeImage(dataURL[1],targetFolder).then(uri=>{
            if(returnType=="Base64"){
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

export interface loc {
  long: number;
  lat: number;
}