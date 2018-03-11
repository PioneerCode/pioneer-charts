import { Component, OnInit, Input } from '@angular/core';
import { IBarChartConfig } from './bar-chart.model';

@Component({
  selector: 'pcac-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {
  @Input() config: IBarChartConfig;

  constructor() { }

  ngOnInit() {
  }
}
