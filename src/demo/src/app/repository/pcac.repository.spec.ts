import { TestBed, inject } from '@angular/core/testing';

import { PcacRepository } from './pcac.repository';

describe('PcacRepository', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PcacRepository]
    });
  });

  it('should be created', inject([PcacRepository], (service: PcacRepository) => {
    expect(service).toBeTruthy();
  }));
});
