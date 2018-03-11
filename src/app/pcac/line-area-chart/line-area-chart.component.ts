import { Component, OnInit, Input } from '@angular/core';
import { ILineAreaChartConfig } from './line-area-chart.model';

@Component({
  selector: 'pcac-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  styleUrls: ['./line-area-chart.component.scss']
})
export class LineAreaChartComponent implements OnInit {
  @Input() config: ILineAreaChartConfig;

  constructor() { }

  ngOnInit() {
  }

}
