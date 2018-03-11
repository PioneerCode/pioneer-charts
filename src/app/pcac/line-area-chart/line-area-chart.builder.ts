import { Injectable } from '@angular/core';

export interface ILineAreaChartBuilder {
  buildChart(): void;
}

@Injectable()
export class LineAreaChartBuilder implements ILineAreaChartBuilder {

  constructor() { }

  buildChart(): void {
  }
}
