import { Component } from '@angular/core';
import { PcacService } from '../../services/pcac.service';

@Component({
  selector: 'pc-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  styleUrls: ['./line-area-chart.component.scss']
})
export class LineAreaChartComponent {
  constructor(public pcacService: PcacService) { }
}

