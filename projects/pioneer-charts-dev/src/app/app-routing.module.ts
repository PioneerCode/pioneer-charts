import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TestComponent } from '../test/test.component';
import { ChartsComponent } from './charts/charts.component';


const routes: Routes = [
  { path: '', redirectTo: 'charts', pathMatch: 'full'},
  { path: 'charts', component: ChartsComponent },
  { path: 'test', component: TestComponent }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
