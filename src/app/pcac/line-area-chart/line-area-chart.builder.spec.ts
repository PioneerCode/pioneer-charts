import { TestBed, inject } from '@angular/core/testing';

import { LineAreaChartBuilder } from './line-area-chart.builder';

describe('LineAreaChartBuilder', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LineAreaChartBuilder]
    });
  });

  it('should be created', inject([LineAreaChartBuilder], (service: LineAreaChartBuilder) => {
    expect(service).toBeTruthy();
  }));
});
