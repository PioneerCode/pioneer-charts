import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PcacSpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  let component: PcacSpinnerComponent;
  let fixture: ComponentFixture<PcacSpinnerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PcacSpinnerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PcacSpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
