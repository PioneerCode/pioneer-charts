import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { ILineAreaChartConfig } from './line-area-chart.model';
import { LineAreaChartBuilder } from './line-area-chart.builder';

@Component({
  selector: 'pcac-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  styleUrls: ['./line-area-chart.component.scss'],
  providers: [
    LineAreaChartBuilder
  ]
})
export class LineAreaChartComponent implements OnInit {
  @Input() config: ILineAreaChartConfig;
  @ViewChild('chart') chartElm: ElementRef;

  constructor(
    private chartBuilder: LineAreaChartBuilder,
  ) { }

  ngOnInit() {
  }

  buildChart(): void {
    this.chartBuilder.buildChart(this.chartElm, this.config);
  }

  @HostListener('window:resize')
  resize(): void {
    this.buildChart();
  }
}
