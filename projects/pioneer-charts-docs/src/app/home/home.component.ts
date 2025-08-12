import { Component, inject } from '@angular/core';
import { PcacLineAreaChartComponent } from '@pioneer-code/pioneer-charts';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AppService, MainRoutes } from '../app.service';

@Component({
  selector: 'pc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    MatButtonModule,
    MatCardModule,
    PcacLineAreaChartComponent,
  ]
})
export class HomeComponent {
  readonly appService = inject(AppService);
  MainRoutes = MainRoutes;


}
