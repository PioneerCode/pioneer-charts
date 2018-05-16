import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  OnChanges,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';
import { IPcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { IPcacData } from '../../core';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'pcac-bar-vertical-chart',
  templateUrl: './bar-vertical-chart.component.html',
  providers: [
    BarVerticalChartBuilder
  ]
})
export class PcacBarVerticalChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() config: IPcacBarVerticalChartConfig;
  @ViewChild('chart') chartElm: ElementRef;
  @Output() barClicked: EventEmitter<IPcacData> = new EventEmitter();
  private resizeEvent: Subscription;

  constructor(
    private chartBuilder: BarVerticalChartBuilder
  ) {
    this.chartBuilder.barClicked$.subscribe(data => {
      this.barClicked.emit(data);
    });
  }

  ngAfterViewInit() {
    this.resizeEvent = fromEvent(window, 'resize').pipe(
      debounceTime(100)
    ).subscribe((event) => {
      this.buildChart();
    });
  }

  ngOnDestroy() {
    this.resizeEvent.unsubscribe();
  }

  ngOnChanges() {
    if (this.config && this.config.data) {
      this.buildChart();
    }
  }

  buildChart(): void {
    this.chartBuilder.buildChart(this.chartElm, this.config);
  }
}
