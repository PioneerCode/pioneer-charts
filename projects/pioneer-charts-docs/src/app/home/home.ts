import { Component, inject } from '@angular/core';
import { PcacAreaChart } from '@pioneer-code/pioneer-charts';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AppService } from '../app.service';
import { LayoutResourceState } from '../layout/resource-state/resource-state';
import { ChartCard } from '../layout/chart-card/chart-card';
import { ChartContract } from '../layout/chart-contract/chart-contract';

@Component({
  selector: 'pc-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
  imports: [
    ChartCard,
    ChartContract,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    PcacAreaChart,
    LayoutResourceState,
  ]
})
export class Home {
  readonly appService = inject(AppService);
}
