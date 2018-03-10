import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineAreaChartComponent } from './line-area-chart.component';

describe('LineAreaChartComponent', () => {
  let component: LineAreaChartComponent;
  let fixture: ComponentFixture<LineAreaChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineAreaChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineAreaChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
