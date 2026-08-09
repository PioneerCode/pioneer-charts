import { Component, inject } from '@angular/core';
import { PcacAreaChart } from '@pioneer-code/pioneer-charts';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppService, MainRoutes } from '../app.service';
import { LayoutResourceState } from '../layout/resource-state/resource-state';

@Component({
  selector: 'pc-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    PcacAreaChart,
    LayoutResourceState,
  ]
})
export class Home {
  readonly appService = inject(AppService);
  MainRoutes = MainRoutes;
}
