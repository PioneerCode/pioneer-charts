import { Component, ElementRef, OnChanges, ViewEncapsulation, inject, viewChild, input } from '@angular/core';
import { outputFromObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { PcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';

@Component({
  selector: 'pcac-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [PieChartBuilder]
})
export class PcacPieChartComponent implements OnChanges {
  private chartBuilder = inject(PieChartBuilder);

  readonly config = input.required<PcacPieChartConfig>();
  readonly chartElm = viewChild.required<ElementRef>('chart');
  readonly sliceClicked = outputFromObservable(this.chartBuilder.sliceClicked$);

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
