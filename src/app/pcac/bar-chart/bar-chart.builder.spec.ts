import { TestBed, inject } from '@angular/core/testing';

import { BarChartBuilder } from './bar-chart.builder';

describe('BarChartBuilder', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BarChartBuilder]
    });
  });

  it('should be created', inject([BarChartBuilder], (service: BarChartBuilder) => {
    expect(service).toBeTruthy();
  }));
});
