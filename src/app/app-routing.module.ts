import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RecomendationsComponent } from './components/recomendations/recomendations.component';
import { ReportsComponent } from './components/reports/reports.component';
import { SensorsComponent } from './components/sensors/sensors.component';
import { DocBoardComponent } from './components/doc-board/doc-board.component';
import { MetaSenderComponent } from './components/meta/meta-sender/meta-sender.component';
import { PatientDataComponent } from './components/patient-data/patient-data.component';

const routes: Routes = [
    { path: '', redirectTo: '/meta', pathMatch: 'full' },
    { path: 'meta', component: MetaSenderComponent },
    { path: 'home', component: HomeComponent },
    { path: 'recomendations', component: RecomendationsComponent },
    { path: 'reports', component: ReportsComponent },
    { path: 'sensors', component: SensorsComponent },
    { path: 'doc-board', component: DocBoardComponent },
    { path: 'patient-data', component: PatientDataComponent},
    { path: '**', redirectTo: '/home'}

  ];

@NgModule({
    imports: [RouterModule.forRoot(routes, {useHash: true})],
    exports: [RouterModule]
})
export class AppRoutingModule { }
