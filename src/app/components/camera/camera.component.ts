import { Component, OnInit } from '@angular/core';
import { CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { ModalController } from '@ionic/angular';
import { MiscService } from 'src/app/services/misc.service';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit {
  imageBase64: string;
  constructor(
    private modal: ModalController,
    private misc: MiscService
  ) { }

  ngOnInit() {
    this.startCam().then(()=>{
      this.misc.camActive=true;
    }).catch(err=>{
      console.log(err);
    });
  }

  startCam(){
    var promise = new Promise((resolve,reject)=>{
      const camOptions: CameraPreviewOptions = {
        position: 'rear',
        parent: 'content', // the id on the ion-content
        className: '',
        storeToFile: true,
        lockAndroidOrientation: true,
        enableZoom: true
      }
      CameraPreview.start(camOptions).then(()=>{
        resolve(true);
      }).catch(err=>{
        reject(err);
      });
    });
    return promise;
  }

  takePicture() {
    const cameraPreviewPictureOptions: CameraPreviewPictureOptions = {
      quality: 100
    };
    CameraPreview.capture(cameraPreviewPictureOptions).then(result=>{
      this.imageBase64 = `data:image/jpeg;base64,${result.value}`;
      this.stopCamera();
    });
  }

  stopCamera() {
    CameraPreview.stop().then(()=>{
      this.misc.camActive = false;
      this.modal.dismiss(this.imageBase64);
    });
  }

  flipCamera() {
    CameraPreview.flip().then(acc=>{
      console.log(acc);
    },rej=>{
      console.log(rej);
    }).catch(err=>{
      console.log(err);
    });
  }
}
