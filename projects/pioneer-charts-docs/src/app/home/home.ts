import { Component, inject } from '@angular/core';
import { PcacLineAreaChartComponent } from '@pioneer-code/pioneer-charts';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppService, MainRoutes } from '../app.service';

@Component({
  selector: 'pc-home',
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    PcacLineAreaChartComponent,
  ]
})
export class Home {
  readonly appService = inject(AppService);
  MainRoutes = MainRoutes;
}
