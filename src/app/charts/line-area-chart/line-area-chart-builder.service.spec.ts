import { TestBed, inject } from '@angular/core/testing';

import { LineAreaChartBuilderService } from './line-area-chart-builder.service';

describe('LineAreaChartBuilderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LineAreaChartBuilderService]
    });
  });

  it('should be created', inject([LineAreaChartBuilderService], (service: LineAreaChartBuilderService) => {
    expect(service).toBeTruthy();
  }));
});
