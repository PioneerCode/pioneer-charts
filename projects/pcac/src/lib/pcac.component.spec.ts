import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PcacComponent } from './pcac.component';

describe('PcacComponent', () => {
  let component: PcacComponent;
  let fixture: ComponentFixture<PcacComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PcacComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcacComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
