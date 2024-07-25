import { Routes } from '@angular/router';
import { ChartsComponent } from './charts/charts.component';
import { TestComponent } from './test/test.component';



export const routes: Routes = [
  { path: '', redirectTo: 'charts', pathMatch: 'full'},
  { path: 'charts', component: ChartsComponent },
  { path: 'test', component: TestComponent }
];
