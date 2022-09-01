import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CameraComponent } from './camera.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule],
  declarations: [CameraComponent],
  exports: [CameraComponent]
})
export class CameraComponentModule {}
