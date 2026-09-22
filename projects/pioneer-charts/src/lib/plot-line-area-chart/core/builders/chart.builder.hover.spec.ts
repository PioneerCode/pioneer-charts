import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacPlotChartConfig } from '../../plot/plot.model';
import { PcacFormatEnum } from '../../../core/chart.model';
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

const config: PcacPlotChartConfig = {
  height: 200,
  enableEffects: false,
  enableZoomX: false,
  enableZoomY: false,
  xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100 },
  yAxis: { domainMin: 0, domainMax: 100 },
  colorOverride: [],
  data: [{ key: 'a', value: null, hide: false, data: [{ key: 50, value: 60, hide: false, data: [] }] }],
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Regression test: the hover grow/shrink ran as an unnamed transition on the dot, the same name
// as the enter transition that rises it from the baseline - so hovering (or leaving) a dot while
// the chart was still animating in cancelled the rise, and the dot stayed wherever it had got to,
// below its value, until the next rebuild. Runs the real (shortened) transitions.
describe('PlaChartBuilder dot hover during the enter transition', () => {
  // Long enough that a timer firing late on a busy machine still lands inside the rise.
  const duration = 300;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    vi.spyOn(TestBed.inject(PcacTransitionService), 'getTransitionDuration').mockReturnValue(duration);
    vi.spyOn(PlaChartBuilder.prototype, 'showTooltip').mockImplementation(() => undefined);
    vi.spyOn(PlaChartBuilder.prototype, 'hideTooltip').mockImplementation(() => undefined);
  });

  afterEach(() => vi.restoreAllMocks());

  function build(): { svg: SVGSVGElement; dot: SVGCircleElement; point: Element } {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config, PcacLineAreaPlotChartConfigType.Plot);
    const svg = elm.nativeElement as SVGSVGElement;
    return { svg, dot: svg.querySelector('circle.dot')!, point: svg.querySelector('.point')! };
  }

  it('still rises the dot to its value when it is hovered mid-rise', async () => {
    const { dot, point } = build();

    await wait(duration / 3);
    point.dispatchEvent(new MouseEvent('mouseover'));
    await wait(duration * 2);

    expect(Number(dot.getAttribute('cy'))).toBeCloseTo(0);
    expect(Number(dot.getAttribute('r'))).toBeCloseTo(6);
  });

  it('still rises the dot when the hover ends mid-rise, and settles it at rest size', async () => {
    const { dot, point } = build();

    await wait(duration / 4);
    point.dispatchEvent(new MouseEvent('mouseover'));
    point.dispatchEvent(new MouseEvent('mouseout'));
    await wait(duration * 2);

    expect(Number(dot.getAttribute('cy'))).toBeCloseTo(0);
    expect(Number(dot.getAttribute('r'))).toBeCloseTo(4);
    expect(dot.getAttribute('fill')).toBe('rgb(255, 255, 255)');
  });
});
