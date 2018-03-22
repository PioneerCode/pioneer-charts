import { Component, OnInit } from '@angular/core';
import { ITableConfig, IPcacBarVerticalChartConfig, ILineAreaChartConfig } from '@pioneer-code/pioneer-code-angular-charts';
import { PcacService } from '../../services/pc.service';

@Component({
  selector: 'pc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  constructor(public pcacService: PcacService) { }
}
