import {
  Component,
  Input,
  ViewChild,
  ElementRef,
  OnChanges,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { IPcacPieChartConfig } from './pie-chart.model';
import { PieChartBuilder } from './pie-chart.builder';
import { IPcacData } from '../core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'pcac-pie-chart',
  templateUrl: './pie-chart.component.html',
  providers: [
    PieChartBuilder
  ]
})
export class PcacPieChartComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() config: IPcacPieChartConfig;
  @ViewChild('chart') chartElm: ElementRef;
  @Output() sliceClicked: EventEmitter<IPcacData> = new EventEmitter();
  private resizeEvent: Subscription;

  constructor(
    private chartBuilder: PieChartBuilder
  ) {
    this.chartBuilder.sliceClicked$.subscribe(data => {
      this.sliceClicked.emit(data);
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
