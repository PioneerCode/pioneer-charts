import { Injectable, ElementRef } from '@angular/core';
import { select } from 'd3-selection';
import { Line, Area } from 'd3-shape';
import { range } from 'd3-array';
import { Subject } from 'rxjs';

/**
 * Lib
 */
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { IPcacAxisBuilderConfig } from '../../../core/axis.builder';
import { IPcacGridBuilderConfig } from '../../../core/grid.builder';
import { PcacChart } from '../../../core/chart';
import { PcacData } from '../../../core/chart.model';
import { PlaChartScalesBuilder, PlaChartScales } from './scales.builder';
import { getXFormat } from '../x-format';
import { buildLineGenerator } from './line-generator.builder';
import { buildAreaGenerator } from './area-generator.builder';
import { buildZoomBehavior } from './zoom-behavior.builder';


@Injectable({
  providedIn: 'root',
})
export class PlaChartBuilder extends PcacChart {
  private scales!: PlaChartScales;
  private lineGenerator!: Line<[number, number]>;
  private areaGenerator!: Area<[number, number]>;
  private zoomBehavior!: d3.ZoomBehavior<Element, unknown>;
  private dotClickedSource = new Subject<PcacData>();
  private config!: PcacLineAreaChartConfig;
  dotClicked$ = this.dotClickedSource.asObservable();


  buildChart(chartElm: ElementRef, config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    this.config = JSON.parse(JSON.stringify(config));
    this.startData = range(this.config.data[0].data.length).map(() => {
      return {
        value: 0,
        key: ''
      };
    });

    if (this.config.hideAxis) {
      this.config.height = this.config.height + 12;
      this.margin.top = 8;
      this.margin.bottom = 8;
      this.margin.left = 8;
      this.margin.right = 8;
    }

    this.initializeChartState(chartElm, this.config);
    if (this.config.colorOverride) {
      this.colors = this.config.colorOverride;
    }

    this.scales = new PlaChartScalesBuilder().build(config, this.width, this.height);
    this.lineGenerator = buildLineGenerator(config.xFormat, this.scales);
    this.areaGenerator = buildAreaGenerator(config.xFormat, this.scales, this.height);

    if (this.config.enableZoom) {
      this.zoomBehavior = buildZoomBehavior(this.width, this.height, (event) => {
        // Rescale x
        const newX = event.transform.rescaleX(this.scales.x);

        // Update axis
        this.axisBuilder.drawXAxis({
          svg: this.svg,
          numberOfTicks: this.config.numberOfTicks || 5,
          height: this.height,
          xScale: newX,
          yScale: this.scales.y,
          yFormat: this.config.yFormat,
          xFormat: this.config.xFormat
        } as IPcacAxisBuilderConfig);

        // Update lines/areas
        this.svg.selectAll('.line')
          .attr('d', (d: any) => this.lineGenerator.x((_: any, i: number) => newX(i))(d));

        this.svg.selectAll('.area')
          .attr('d', (d: any) => this.areaGenerator.x((_: any, i: number) => newX(i))(d));

        // Update dots
        this.svg.selectAll('.dot')
          .attr('cx', (d: PcacData, i: number) => getXFormat(this.config.xFormat, d, i, newX));
      });
    }

    this.drawChart(chartElm, this.config, type);
  }

  private drawChart(chartElm: ElementRef, config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    this.buildContainer(chartElm);
    this.attachZoomBehavior();

    if (!config.hideAxis) {
      this.axisBuilder.drawAxis({
        svg: this.svg,
        numberOfTicks: config.numberOfTicks || 5,
        height: this.height,
        xScale: this.scales.x,
        yScale: this.scales.y,
        yFormat: config.yFormat,
        xFormat: config.xFormat
      } as IPcacAxisBuilderConfig);
    }

    if (!config.hideGrid) {
      this.gridBuilder.drawHorizontalGrid({
        svg: this.svg,
        numberOfTicks: config.numberOfTicks || 5,
        width: this.width,
        xScale: this.scales.x,
        yScale: this.scales.y
      } as IPcacGridBuilderConfig);
    }

    this.drawLineArea(config, type);

    if (config.enableEffects) {
      new PlaChartEffectsBuilder().buildEffects({
        svg: this.svg,
        height: this.height,
        width: this.width,
        data: config.data,
        colors: this.colors,
        x: this.scales.x,
        y: this.scales.y
      });
    }

    this.drawDots(config);
  }

  private attachZoomBehavior(): void {
    if (!this.config.enableZoom) return;

    // Add a transparent rect to capture zoom events
    this.svg.insert('rect', ':first-child')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .call(this.zoomBehavior)
      .transition()
      .duration(750)

    this.svg.call(this.zoomBehavior)
      .transition()
      .duration(750)
  }

  private drawLineArea(config: PcacLineAreaChartConfig, type: PcacLineAreaPlotChartConfigType): void {
    for (let i = 0; i < config.data.length; i++) {
      if (type === PcacLineAreaPlotChartConfigType.Area) {
        this.drawArea(config.data[i].data, i);
      } else if (type === PcacLineAreaPlotChartConfigType.Line) {
        this.drawLine(config.data[i].data, i, config.data[i].hide);
      }
    }
  }

  private drawLine(lineData: PcacData[], index: number, hide = false): void {
    this.svg.append('g')
      .attr('class', 'lines')
      .append('path')
      .datum(lineData)
      .attr('class', 'line')
      .attr('d', this.lineGenerator(this.startData))
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('d', this.lineGenerator as any) // TODO: strongly type
      .attr('stroke', () => {
        return this.colors[index];
      })
      .attr('fill', 'none')
      .attr('style', () => hide ? 'display: none' : null);
  }

  private drawArea(lineData: PcacData[], index: number) {
    this.svg.append('g')
      .attr('class', 'areas')
      .append('path')
      .datum(lineData)
      .attr('class', 'area')
      .style('opacity', 0.5)
      .style('fill', () => {
        return this.colors[index];  // TODO: strongly type
      })
      .attr('d', this.lineGenerator(this.startData))
      .transition()
      .duration(this.transitionService.getTransitionDuration())
      .attr('d', this.areaGenerator as any);  // TODO: strongly type
  }

  private drawDots(config: PcacLineAreaChartConfig): void {
    const self = this;
    for (let index = 0; index < config.data.length; index++) {
      this.svg.append('g')
        .attr('class', 'dots')
        .selectAll('.dot')
        .data(config.data[index].data)
        .enter().append('circle')
        .attr('class', 'dot')
        .attr('stroke', (_: PcacData) => {
          return this.colors[index];
        })
        .attr('cx', (d: PcacData, i: number) => {
          return getXFormat(config.xFormat, d, i, this.scales.x);
        })
        .attr('cy', (d: PcacData) => {
          return this.scales.y(0);
        })
        .attr('fill', '#fff')
        .on('mouseover', function (this: any, event: MouseEvent, d: PcacData) {
          self.tooltipBuilder.showBarTooltip(event, d, self.config.yFormat, self.config.xFormat);
          select(this)
            .transition()
            .duration(self.transitionService.getTransitionDuration() / 3)
            .attr('r', 6)
            .attr('fill', self.colors[index]);
        })
        .on('mouseout', function (this: any) {
          self.tooltipBuilder.hideTooltip();
          select(this)
            .transition()
            .duration(self.transitionService.getTransitionDuration() / 3)
            .attr('r', 4)
            .attr('fill', '#fff');
        })
        .on('click', (d: PcacData, i: number) => {
          this.dotClickedSource.next(d);
        })
        .transition()
        .duration(this.transitionService.getTransitionDuration())
        .attr('cy', (d: PcacData) => {
          return this.scales.y(d.value as number);
        })
        .attr('r', 4)
        .attr('style', () => config.data[index].hide ? 'display: none' : null);
    }
  }
}
