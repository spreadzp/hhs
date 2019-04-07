import 'reflect-metadata';
import '../polyfills';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatToolbarModule
} from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import {MetaModule} from './components/meta/meta.module';
// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';
import { ProvidersModule } from './providers/providers.module';

import { WebviewDirective } from './directives/webview.directive';

import { TableDataModule } from './components/table-data/table-data.module';
import { HomeComponent } from './components/home/home.component';
import { SensorsComponent } from './components/sensors/sensors.component';
import { AllDatasComponent } from './components/all-datas/all-datas.component';
import { DocBoardComponent } from './components/doc-board/doc-board.component';
import { RecomendationsComponent } from './components/recomendations/recomendations.component';
import { ReportsComponent } from './components/reports/reports.component';
import { TableDataComponent } from './components/table-data/table-data.component';
import { NavHealthComponent } from './components/nav-health/nav-health.component';
import { AppComponent } from './app.component';
import { ModalComponent } from './components/modal/modal.component';
import { PatientDataComponent } from './components/patient-data/patient-data.component';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

const modules = [
  CommonModule,
  TableDataModule,
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatToolbarModule,
  BrowserAnimationsModule,
  FormsModule,
  HttpClientModule,
  AppRoutingModule,
  BrowserModule,
  AppRoutingModule,
  ProvidersModule,
  MetaModule,  
  TranslateModule.forRoot({
    loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
    }
})
];
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    WebviewDirective,
    SensorsComponent,
    AllDatasComponent,
    DocBoardComponent,
    RecomendationsComponent,
    ReportsComponent,
    TableDataComponent,
    NavHealthComponent,
    ModalComponent,
    PatientDataComponent,
  ],
  entryComponents: [ModalComponent],
 /*  exports: [
    ...modules
  ], */
  imports: [
    ...modules
  ],
  providers: [ElectronService],
  bootstrap: [AppComponent]
})
export class AppModule { }
