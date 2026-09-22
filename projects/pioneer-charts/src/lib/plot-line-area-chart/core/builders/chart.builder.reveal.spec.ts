import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacPlotChartConfig } from '../../plot/plot.model';
import { PcacData, PcacFormatEnum } from '../../../core/chart.model';
import { PcacTransitionService } from '../../../core/transition.service';

/** Same technique as chart.builder.point-image.spec.ts. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

const point = (): PcacData => ({ key: 50, value: 60, hide: false, data: [], range: { y: { min: 50, max: 70 } } });

/** Two coincident points, so there's a fan-out, each with a range. */
const config: PcacPlotChartConfig = {
  height: 200,
  enableEffects: false,
  enableZoomX: false,
  enableZoomY: false,
  xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100 },
  yAxis: { domainMin: 0, domainMax: 100 },
  colorOverride: [],
  pointFanOut: {},
  pointRange: {},
  data: [0, 1].map((i) => ({ key: `series ${i}`, value: null, hide: false, data: [point()] })),
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Regression test: the fan-out spokes and anchor faded in over the same time the points rose in
// from the baseline, so for the whole rise they pointed at where the points were going to be,
// not where they were. They (and the point ranges, drawn the same way) now stay hidden until the
// rise is over. Runs the real (shortened) transitions.
describe('PlaChartBuilder guides around the points during the enter transition', () => {
  // Long enough that a timer firing late on a busy machine still leaves a wide margin either side
  // of the reveal (hidden until `duration`, shown by `duration * 4 / 3`).
  const duration = 300;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    vi.spyOn(TestBed.inject(PcacTransitionService), 'getTransitionDuration').mockReturnValue(duration);
  });

  afterEach(() => vi.restoreAllMocks());

  it('keeps the fan-outs and point ranges hidden while the points rise, then shows them', async () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config, PcacLineAreaPlotChartConfigType.Plot);
    const svg = elm.nativeElement as SVGSVGElement;
    const opacity = (selector: string) => Number(svg.querySelector(selector)!.getAttribute('opacity'));

    await wait(duration / 2);
    expect(opacity('.fan-out')).toBe(0);
    expect(opacity('.point-ranges')).toBe(0);

    await wait(duration * 1.5);
    expect(opacity('.fan-out')).toBe(1);
    expect(opacity('.point-ranges')).toBe(1);
  });
});
