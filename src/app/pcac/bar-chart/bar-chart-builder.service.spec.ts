import { TestBed, inject } from '@angular/core/testing';

import { BarChartBuilderService } from './bar-chart-builder.service';

describe('BarChartBuilderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BarChartBuilderService]
    });
  });

  it('should be created', inject([BarChartBuilderService], (service: BarChartBuilderService) => {
    expect(service).toBeTruthy();
  }));
});
