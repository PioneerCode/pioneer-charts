import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { IBarChartConfig } from './bar-chart.model';
import { BarChartBuilder } from './bar-chart.builder';

@Component({
  selector: 'pcac-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  providers: [
    BarChartBuilder
  ]
})
export class BarChartComponent implements OnInit {
  @Input() config: IBarChartConfig;
  @ViewChild('chart') chartElm: ElementRef;

  constructor(
    private chartBuilder: BarChartBuilder,
  ) { }

  ngOnInit() {
  }

  buildChart(): void {
    this.chartBuilder.buildChart();
  }

  @HostListener('window:resize')
  resize(): void {
    this.buildChart();
  }
}
