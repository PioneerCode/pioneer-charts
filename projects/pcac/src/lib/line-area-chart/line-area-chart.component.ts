import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  EventEmitter,
  Output,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import { IPcacLineAreaChartConfig } from './line-area-chart.model';
import { LineAreaChartBuilder } from './line-area-chart.builder';
import { IPcacData } from '../core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'pcac-line-area-chart',
  templateUrl: './line-area-chart.component.html',
  providers: [
    LineAreaChartBuilder
  ]
})
export class PcacLineAreaChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() config: IPcacLineAreaChartConfig;
  @ViewChild('chart') chartElm: ElementRef;
  @Output() dotClicked: EventEmitter<IPcacData> = new EventEmitter();
  private resizeEvent: Subscription;

  constructor(
    private chartBuilder: LineAreaChartBuilder
  ) {
    this.chartBuilder.dotClicked$.subscribe(data => {
      this.dotClicked.emit(data);
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
