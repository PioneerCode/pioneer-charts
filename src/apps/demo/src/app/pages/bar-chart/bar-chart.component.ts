import { Component } from '@angular/core';
import { PcacService } from '../../services/pcac.service';

@Component({
  selector: 'pc-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent {
  constructor(public pcacService: PcacService) { }
}
