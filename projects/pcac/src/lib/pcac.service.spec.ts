import { TestBed, inject } from '@angular/core/testing';

import { PcacService } from './pcac.service';

describe('PcacService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PcacService]
    });
  });

  it('should be created', inject([PcacService], (service: PcacService) => {
    expect(service).toBeTruthy();
  }));
});
