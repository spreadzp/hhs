import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatModule} from './../../material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const modules = [
  MatModule,
  BrowserAnimationsModule,
  CommonModule,
];

@NgModule({
  imports: [
    ...modules
  ],
  //declarations: [TableDataComponent],
  exports: [
    ...modules
  ]
})

export class TableDataModule {
}
