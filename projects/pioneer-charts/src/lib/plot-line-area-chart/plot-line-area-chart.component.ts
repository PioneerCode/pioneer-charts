import { Component, ElementRef, ViewEncapsulation, SimpleChanges, viewChild, input } from '@angular/core';
import { outputFromObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from './plot-line-area-chart.model';
import { PlaChartBuilder } from './core/builders/chart.builder';

@Component({
  selector: 'pcac-line-area-chart',
  templateUrl: './plot-line-area-chart.component.html',
  styleUrls: ['./plot-line-area-chart.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PcacLineAreaChartComponent {
  private chartBuilder = new PlaChartBuilder();

  readonly config = input.required<PcacLineAreaChartConfig>();
  readonly type = input.required<PcacLineAreaPlotChartConfigType>();


  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly dotClicked = outputFromObservable(this.chartBuilder.dotClicked$);

  private resize = new Subject<void>();

  constructor() {
    this.resize.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(() => this.buildChart());

    fromEvent(window, 'resize').pipe(
      takeUntilDestroyed()
    ).subscribe(() => this.resize.next());
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['config'].currentValue !== changes['config'].previousValue) {
      this.buildChart()
    }
  }

  buildChart(): void {
    const config = this.config();
    if (config && config.data && config.data.length > 0) {
      this.chartBuilder.buildChart(this.chartElm(), config, this.type());
    }
  }

  onResize(): void {
    this.resize.next();
  }
}
