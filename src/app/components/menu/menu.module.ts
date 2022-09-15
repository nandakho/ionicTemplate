import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { MenuComponent } from './menu.component';

@NgModule({
  imports: [ CommonModule, FormsModule, IonicModule, RouterModule ],
  declarations: [MenuComponent],
  exports: [MenuComponent]
})
export class MenuComponentModule {}
