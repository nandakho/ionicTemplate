import { Injectable } from '@angular/core';
import { Toast } from '@capacitor/toast';

@Injectable({
  providedIn: 'root'
})
export class MiscService {

  constructor() { }

  showToast(message){
    var toastExist = document.getElementsByTagName("pwa-toast").length;
    if(toastExist>0){
      const prevHeight = document.getElementsByTagName("pwa-toast").item(toastExist-1).getBoundingClientRect().height;
      for (let index = 0; index < toastExist; index++) {
        const element = document.getElementsByTagName("pwa-toast").item(index).getBoundingClientRect();
        document.getElementsByTagName("pwa-toast").item(index).style.position = "fixed";
        document.getElementsByTagName("pwa-toast").item(index).style.top = String(element.top-(prevHeight*2)-10)+"px";
      }
    }
    Toast.show({
      text: message
    });
  }
}
