import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartNavComponent } from './chart-nav.component';

describe('ChartNavComponent', () => {
  let component: ChartNavComponent;
  let fixture: ComponentFixture<ChartNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChartNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChartNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
