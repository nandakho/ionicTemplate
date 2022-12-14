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
  darkTheme: boolean = false;
  camActive: boolean = false;
  onSync: boolean = false;
  backSubs: BehaviorSubject<boolean> = new BehaviorSubject(false);
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
   * @param imageData Base64 of image
   * @param targetFolder Folder to put the image (if needed)
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
   * Delete everything in download folder except anything listed in keepThis parameter
   * @param keepThis List any files in this array to exclude from deletion
   */
  async downloadPurge(keepThis=[]){
    const downloadDir = "download";
    await this.writeImage("",downloadDir+"/");
    const rawList = await Filesystem.readdir({
      directory: Directory.External,
      path: downloadDir
    });
    const existList = Object.values(rawList.files).map((i)=>{
      return i.name;
    });
    for(let i=0; i<existList.length;i++){
      if(!keepThis.includes(existList[i])){
        await Filesystem.deleteFile({
          directory: Directory.External,
          path: downloadDir+"/"+existList[i]
        });
      }
    }
  }

  /**
   * Check if file exist and return existing size
   * @param fileName Name of the file
   * @returns Promise<number>
   */
  async downloadExist(fileName:string): Promise<number> {
    try {
      const exist = await Filesystem.stat({
        path: "download/"+fileName,
        directory: Directory.External
      });
      return Promise.resolve(exist.size);
    } catch (err) {
      return Promise.resolve(0);
    }
  }

  /**
   * Load image from external directory
   * @param imageName Image file name
   * @param folder Directory where the file is stored, please include backslash (example: "download/")
   * @returns Promise<string>
   */
  async loadImage(imageName: string,folder: string=""): Promise<string> {
    const exist = await this.downloadExist(imageName)>0?true:false;
    if(exist){
      const image = await Filesystem.readFile({
        path: folder+imageName,
        directory: Directory.External
      });
      return "data:image/png;base64,"+image.data;
    }
    return "assets/image/no-img.jpg";
  }

  /**
   * Navigation..
   * @param page Where you want to navigate
   * @param direction One of these: "root", "forward", or "backward"
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
   * Go back 1 page
   * @returns void
   */
  async goBack(): Promise<void> {
    try {
      this.nav.back();
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error(err));
    }
  }

  /**
   * Show toast, automatically push existing toast up if another toast is called
   * @param message What you want to tell
   * @param duration How long shall it be shown in ms (default 3000ms)
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
   * @param returnType It's either Base64 or URI
   * @param targetFolder  Where it's stored
   * @returns string|WriteFileResult
   */
   async openCam(returnType:"Base64"|"uri",targetFolder=""){
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
  
  /**
   * Convert string of date to another format
   * @param dateString Date in string format, expected format: "year/month/day hour:minute:second" or "year/month/date"
   * @param format Return date format "short" or "long", short will use number for month "01,02,...", long will use string for month "Jan,Feb,..."
   * @param separator Return date separator, what separator you want. (example: "-", result: "01-01-2000")
   * @param includeTime Include time or not, separator for time will not be changed. Will be ignored if source doesn't have time.
   * @returns string
   */
  dateConvert(dateString: string,format:"short"|"long",separator: string,includeTime: boolean): string{
    const timeExist = dateString.length==10?false:true;
    var date = [
      dateString.substring(8,10),
      format=="short"?dateString.substring(5,7):this.monthName(parseInt(dateString.substring(5,7))),
      dateString.substring(0,4)
    ];
    var time = "";
    if(timeExist&&includeTime){
      time = dateString.substring(10);
    }
    return date.join(separator)+time;
  }

  /**
   * Number to month name
   * @param number 
   * @returns string
   */
  monthName(number: number): string{
    const name = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    return name[number];
  }
}

export interface loc {
  long: number;
  lat: number;
}