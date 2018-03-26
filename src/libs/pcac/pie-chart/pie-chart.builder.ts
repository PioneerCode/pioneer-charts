import { Injectable, ElementRef } from '@angular/core';
import { IPcacPieChartConfig } from './pie-chart.model';
import { arc, pie, DefaultArcObject } from 'd3-shape';
import { PcacColorService } from '../core/color.service';
import { PcacChart } from '../core/chart';
import { IPcacData } from '../core/chart.model';


export interface IPieChartBuilder {
  buildChart(chartElm: ElementRef, config: IPcacPieChartConfig): void;
}

@Injectable()
export class PieChartBuilder extends PcacChart implements IPieChartBuilder {
  private radius: number;
  private arcShape: d3.Arc<any, DefaultArcObject>;   // TODO: Strongly type
  private pieAngles: d3.Pie<any, any>;   // TODO: Strongly type

  buildChart(chartElm: ElementRef, config: IPcacPieChartConfig): void {
    this.setup(chartElm, config);
    this.radius = Math.min(this.width, this.height) / 2;
    this.buildShapes(config);
    this.drawChart(chartElm, config);
  }

  private buildShapes(config: IPcacPieChartConfig): void {
    this.arcShape = arc()
      .outerRadius(this.radius - 10)
      .innerRadius(0);

    this.pieAngles = pie()
      .sort(null)
      .value((d: any) => d.value);   // TODO: Strongly type
  }

  private drawChart(chartElm: ElementRef, config: IPcacPieChartConfig): void {
    this.prepSvg(chartElm);
  }

}
