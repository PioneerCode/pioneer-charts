import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  HostListener,
  OnChanges,
  EventEmitter,
  Output
} from '@angular/core';
import { BarVerticalChartBuilder } from './bar-vertical-chart.builder';
import { IPcacBarVerticalChartConfig } from './bar-vertical-chart.model';
import { IPcacData } from '../../core';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'pcac-bar-vertical-chart',
  templateUrl: './bar-vertical-chart.component.html',
  providers: [
    BarVerticalChartBuilder
  ]
})
export class PcacBarVerticalChartComponent implements OnChanges {
  @Input() config: IPcacBarVerticalChartConfig;
  @ViewChild('chart') chartElm: ElementRef;
  @Output() barClicked: EventEmitter<IPcacData> = new EventEmitter();

  constructor(
    private chartBuilder: BarVerticalChartBuilder
  ) {
    this.chartBuilder.barClicked$.subscribe(data => {
      this.barClicked.emit(data);
    });
    fromEvent(window, 'resize').pipe(
      debounceTime(100)
    ).subscribe((event) => {
      this.buildChart();
    });
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
