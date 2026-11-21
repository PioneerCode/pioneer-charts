import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacLineChartConfig } from '../../line/line.model';
import { PcacData, PcacFormatEnum } from '../../../core/chart.model';
import { PcacTransitionService } from '../../../core/transition.service';

/** Same technique as chart.builder.point-radius.spec.ts. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function point(key: number, value: number, extra: Partial<PcacData> = {}): PcacData {
  return { key, value, hide: false, data: [], ...extra };
}

const SERIES = '#123456';
const RED = '#bb2d3b';

/** Free space over a day, the middle reading below a threshold and flagged red. */
function config(): PcacLineChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoomX: false,
    enableZoomY: false,
    colorOverride: [SERIES],
    xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100 },
    yAxis: { domainMin: 0, domainMax: 100 },
    data: [{
      key: 'Free space', value: null, hide: false,
      data: [point(20, 40), point(50, 8, { color: RED }), point(80, 50)],
    }],
  };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
/** Transitions run at zero length: several of d3's timer frames, so each lands on its end value. */
const settle = () => wait(120);

function build(type: PcacLineAreaPlotChartConfigType): SVGSVGElement {
  const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
  const elm = chartElm();
  builder.buildChart(elm, config(), type);
  return elm.nativeElement;
}

describe('PlaChartBuilder point color', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    vi.spyOn(TestBed.inject(PcacTransitionService), 'getTransitionDuration').mockReturnValue(0);
    vi.spyOn(PlaChartBuilder.prototype, 'showTooltip').mockImplementation(() => undefined);
    vi.spyOn(PlaChartBuilder.prototype, 'hideTooltip').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  const dots = (svg: SVGSVGElement) => Array.from(svg.querySelectorAll('.point .dot'));

  it.each([
    PcacLineAreaPlotChartConfigType.Line,
    PcacLineAreaPlotChartConfigType.Area,
    PcacLineAreaPlotChartConfigType.Plot,
  ])('rings a %s chart\'s point with its own color, and every other with its series\'', (type) => {
    const svg = build(type);

    expect(dots(svg).map((dot) => dot.getAttribute('stroke'))).toEqual([SERIES, RED, SERIES]);
  });

  it('fills a hovered point with its own color, and white again once it is left', async () => {
    const svg = build(PcacLineAreaPlotChartConfigType.Line);
    const [plain, flagged] = Array.from(svg.querySelectorAll('.point'));
    const fill = (point: Element) => point.querySelector('.dot')!.getAttribute('fill');
    await settle();

    flagged.dispatchEvent(new MouseEvent('mouseover'));
    await settle();
    const hovered = fill(flagged);
    flagged.dispatchEvent(new MouseEvent('mouseout'));
    plain.dispatchEvent(new MouseEvent('mouseover'));
    await settle();

    expect([hovered, fill(flagged), fill(plain)]).toEqual(['rgb(187, 45, 59)', 'rgb(255, 255, 255)', 'rgb(18, 52, 86)']);
  });

  it('draws the line itself in its series\' color, whatever its points\'', () => {
    const svg = build(PcacLineAreaPlotChartConfigType.Line);

    expect(svg.querySelector('.line')!.getAttribute('stroke')).toBe(SERIES);
  });
});
