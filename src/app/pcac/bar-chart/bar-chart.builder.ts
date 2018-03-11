import { Injectable } from '@angular/core';

export interface IBarChartBuilder {
  buildChart(): void;
}

@Injectable()
export class BarChartBuilder {

  constructor() { }

  buildChart(): void {
  }
}
