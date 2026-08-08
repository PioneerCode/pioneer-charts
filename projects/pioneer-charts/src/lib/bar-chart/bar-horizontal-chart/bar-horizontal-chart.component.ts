import { Component, ElementRef, OnChanges, ViewEncapsulation, inject, viewChild, input } from '@angular/core';
import { outputFromObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BarHorizontalChartBuilder } from './bar-horizontal-chart.builder';
import { PcacBarHorizontalChartConfig } from './bar-horizontal-chart.model';

@Component({
  selector: 'pcac-bar-horizontal-chart',
  templateUrl: './bar-horizontal-chart.component.html',
  styleUrls: ['./bar-horizontal-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [BarHorizontalChartBuilder]
})
export class PcacBarHorizontalChartComponent implements OnChanges {
  private chartBuilder = inject(BarHorizontalChartBuilder);

  readonly config = input.required<PcacBarHorizontalChartConfig>();
  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly barClicked = outputFromObservable(this.chartBuilder.barClicked$);

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

  ngOnChanges() {
    this.buildChart();
  }

  buildChart(): void {
    const config = this.config();
    if (config && config.data && config.data.length > 0) {
      this.chartBuilder.buildChart(this.chartElm(), config);
    }
  }

  onResize(): void {
    this.resize.next();
  }
}
