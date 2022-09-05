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
  capturing: boolean;
  constructor(
    private modal: ModalController,
    private misc: MiscService
  ) { }

  ngOnInit() {
    this.startCam().then(()=>{
      this.misc.camActive = true;
      this.capturing = false;
    }).catch(err=>{
      this.misc.showToast("Kamera bermasalah: "+err);
    });
  }

  startCam(){
    var promise = new Promise((resolve,reject)=>{
      const subsVar = 70;
      const paddVar = 5;
      const dim = {
        w:Math.floor(window.innerWidth-(2*paddVar)),
        h:Math.floor(window.innerHeight-subsVar-(2*paddVar))
      };
      const camOptions: CameraPreviewOptions = {
        position: 'rear',
        parent: 'camPrev',
        className: '',
        storeToFile: true,
        lockAndroidOrientation: true,
        enableZoom: true,
        toBack: false,
        height: dim.h,
        width: dim.w,
        x: paddVar,
        y: paddVar
      };
      CameraPreview.start(camOptions).then(()=>{
        resolve(true);
      }).catch(err=>{
        reject(err);
      });
    });
    return promise;
  }

  takePicture() {
    this.capturing = true;
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
      this.capturing = false;
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
