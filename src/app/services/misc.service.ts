import { Injectable } from '@angular/core';
import { ToastController, ModalController } from '@ionic/angular';
import { CameraComponent } from '../components/camera/camera.component';

@Injectable({
  providedIn: 'root'
})
export class MiscService {
  camActive: boolean = false;

  constructor(
    private toast: ToastController,
    private modal: ModalController
  ) { }
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

  async openCam(){
    const modal = await this.modal.create({
      component: CameraComponent,
      animated: true
    });
    modal.onDidDismiss().then((data) => {
      if (data.data) {
        console.log(data.data);
        this.showToast("Disimpan");
      } else {
        this.showToast("Dibatalkan");
      }
      this.camActive = false;
    });
    return await modal.present();
  }
}
