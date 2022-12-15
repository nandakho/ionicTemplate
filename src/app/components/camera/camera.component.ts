import { Component, OnInit, ViewChild } from '@angular/core';
import { CameraPosition, CameraPreview, CameraPreviewOptions, CameraPreviewPictureOptions } from '@capacitor-community/camera-preview';
import { ModalController, NavParams } from '@ionic/angular';
import { MiscService } from 'src/app/services';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit {
  @ViewChild('hiddenCanvas') editCanvas;
  imageBase64: string;
  capturing: boolean;
  option: picOpt;
  orient: string;
  orientChange: any;
  lastPos: CameraPosition;

  constructor(
    private modal: ModalController,
    private misc: MiscService,
    private params: NavParams
  ) { }

  ngOnInit() {
    this.orient = screen.orientation.type.split("-")[0];
    this.lastPos = 'rear';
    this.startCam(this.lastPos).then(()=>{
      screen.orientation.addEventListener("change",this.orientChange = (ev) =>{
        this.orient = ev.target.type.split("-")[0];
        CameraPreview.stop().finally(()=>{
          this.startCam(this.lastPos);
        });
      });
      this.option = this.params.get('option');
      if(this.option.location){
        this.misc.geoSubs.next(true);
      }
      this.misc.camActive = true;
      this.capturing = false;
    }).catch(err=>{
      this.misc.showToast(err);
      this.stopCamera();
    });
  }

  startCam(lastPos:CameraPosition = 'rear'){
    var promise = new Promise((resolve,reject)=>{
      const subsVar = 70;
      const paddVar = 10;
      const dim = this.orient=="portrait"?{
        w:Math.floor(window.innerWidth-(2*paddVar)),
        h:Math.floor(window.innerHeight-subsVar-(2*paddVar))
      }:{
        w:Math.floor(window.innerWidth-subsVar-(2*paddVar)),
        h:Math.floor(window.innerHeight-(2*paddVar))
      };
      const camOptions: CameraPreviewOptions = {
        position: lastPos,
        parent: 'camPrev',
        disableExifHeaderStripping: false,
        lockAndroidOrientation: false,
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
      quality: this.option.quality
    };
    CameraPreview.capture(cameraPreviewPictureOptions).then(result=>{
      const angle = this.orient=="landscape"&&this.lastPos=="front"?180:0;
      var canvasElement = this.editCanvas.nativeElement;
      var background = new Image();
      background.src = "data:image/jpeg;base64,"+result.value;
      let ctx = canvasElement.getContext('2d');
      var loc = "";
      background.onload = async () => {
        ctx.canvas.width  = background.width;
        ctx.canvas.height = background.height;
        ctx.translate(background.width / 2, background.height / 2);
        ctx.rotate(angle * Math.PI / 180);
        ctx.drawImage(background, background.width / -2, background.height / -2);
        ctx.lineWidth = 5;
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        if(this.option.location){
          loc = this.misc.curLocation();
        }
        if(this.option.timestamp){
          const timestamp = this.misc.curTimestamp();
          const fontSize = Math.floor(ctx.canvas.width/timestamp.length)<=Math.floor(ctx.canvas.height/timestamp.length)?Math.floor(ctx.canvas.width/timestamp.length):Math.floor(ctx.canvas.height/timestamp.length);
          var tsfont = "bold "+fontSize+"px Calibri";
          ctx.font = tsfont;
          var metrics = ctx.measureText(timestamp);
          const width = metrics.width;
          const fheight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
          const locY = this.option.location&&loc!=""?background.height / 2 - (2.5*fheight):background.height / 2 - fheight;
          ctx.rotate(angle * Math.PI / 180);
          ctx.strokeText(timestamp, background.width / 2 - width - 20, locY);
          ctx.fillText(timestamp, background.width / 2 - width - 20, locY);
          ctx.rotate(angle * Math.PI / 180);
        }
        if(this.option.location&&loc!=""){
          const fontSize = Math.floor(ctx.canvas.width/loc.length)<=Math.floor(ctx.canvas.height/loc.length)?Math.floor(ctx.canvas.width/loc.length):Math.floor(ctx.canvas.height/loc.length);
          if(!this.option.timestamp){
            var tsfont = "bold "+fontSize+"px Calibri";
            ctx.font = tsfont;
          }
          var metrics = ctx.measureText(loc);
          const width = metrics.width;
          const fheight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
          const locY = background.height / 2 - fheight;
          ctx.rotate(angle * Math.PI / 180);
          ctx.strokeText(loc, background.width / 2 - width - 20, locY);
          ctx.fillText(loc, background.width / 2 - width - 20, locY);
          ctx.rotate(angle * Math.PI / 180);
        }
        this.imageBase64 = canvasElement.toDataURL('image/jpeg');
        this.stopCamera();
      }
    });
  }

  stopCamera() {
    CameraPreview.stop().finally(()=>{
      screen.orientation.removeEventListener("change",this.orientChange);
      this.capturing = false;
      if(this.misc.geoSubs.value){
        this.misc.geoSubs.next(false);
      }
      this.misc.camActive = false;
      this.modal.dismiss(this.imageBase64);
    });
  }

  flipCamera() {
    CameraPreview.flip().then(()=>{
      this.lastPos = this.lastPos=='rear'?'front':'rear';
    },rej=>{
      this.misc.showToast(rej);
    }).catch(err=>{
      this.misc.showToast(err);
    });
  }
}

export interface picOpt {
  timestamp?: boolean;
  location?: boolean;
  quality?: number;
}