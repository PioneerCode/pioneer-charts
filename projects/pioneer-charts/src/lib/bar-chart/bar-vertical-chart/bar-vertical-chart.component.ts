import { Component, ElementRef, OnChanges, ViewEncapsulation, inject, viewChild, input } from '@angular/core';
import { outputFromObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';
import { PcacBarVerticalChartConfig } from './bar-vertical-chart.model';

@Component({
  selector: 'pcac-bar-vertical-chart',
  templateUrl: './bar-vertical-chart.component.html',
  styleUrls: ['./bar-vertical-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [BarVerticalChartBuilder]
})
export class PcacBarVerticalChartComponent implements OnChanges {
  private chartBuilder = inject(BarVerticalChartBuilder);

  readonly config = input.required<PcacBarVerticalChartConfig>();
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
