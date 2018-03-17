import { Component, OnInit } from '@angular/core';
import { PcacRepository } from '../../repository/pcac.repository';
import { ITableConfig, IPcacBarChartConfig, ILineAreaChartConfig } from '@pioneer-code/pioneer-code-angular-charts';
import { PcacService } from '../../services/pcac.service';

@Component({
  selector: 'pc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public pcacService: PcacService) { }
}
