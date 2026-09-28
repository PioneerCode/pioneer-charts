import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacData, PcacFormatEnum } from '../../../core/chart.model';

/** Same technique as chart.builder.point-image.spec.ts: a real jsdom `<svg>` with a stubbed parent `clientWidth`. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

const point = (key: number, value: number): PcacData => ({ key, value, hide: false, data: [] });

function config(overrides: Partial<PcacLineAreaChartConfig> = {}): PcacLineAreaChartConfig {
  return {
    ...new PcacLineAreaChartConfig(),
    enableEffects: false,
    xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100 },
    yAxis: { format: PcacFormatEnum.Percentage, domainMin: 0, domainMax: 1 },
    data: [
      { key: 'Wins', value: null, hide: false, data: [point(10, 0.2), point(90, 0.4)] },
      { key: 'Losses', value: null, hide: true, data: [point(50, 0.3)] },
    ],
    ...overrides,
  };
}

describe('PlaChartBuilder keyboard and screen readers', () => {
  let builder: PlaChartBuilder;
  let elm: ElementRef;
  const points = () => Array.from((elm.nativeElement as SVGSVGElement).querySelectorAll<SVGGElement>('.point'));

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    elm = chartElm();
  });

  afterEach(() => builder.ngOnDestroy());

  it('names each point by its series, its key and its value, formatted as the axes are', () => {
    builder.buildChart(elm, config(), PcacLineAreaPlotChartConfigType.Plot);

    expect(points()[0].getAttribute('aria-label')).toBe('Wins, 10: 20%');
    expect(points()[0].getAttribute('role')).toBe('img');
  });

  it('keeps a hidden series out of reach of the arrow keys', () => {
    builder.buildChart(elm, config(), PcacLineAreaPlotChartConfigType.Line);
    points()[0].focus();

    points()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));

    expect(document.activeElement).toBe(points()[1]);
  });

  it('emits dotClicked for Enter on a point', () => {
    const cfg = config();
    builder.buildChart(elm, cfg, PcacLineAreaPlotChartConfigType.Plot);
    const clicked: PcacData[] = [];
    builder.dotClicked$.subscribe((d) => clicked.push(d));

    points()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    // Equal rather than the same object: the builder works on a copy of its config, and a click
    // emits the copy's point too.
    expect(clicked).toEqual([cfg.data[0].data[1]]);
  });

  it("carries a point's id through to dotClicked", () => {
    const cfg = config({
      data: [{ key: 'Wins', value: null, hide: false, data: [{ ...point(10, 0.2), id: 42 }] }],
    });
    builder.buildChart(elm, cfg, PcacLineAreaPlotChartConfigType.Plot);
    const clicked: PcacData[] = [];
    builder.dotClicked$.subscribe((d) => clicked.push(d));

    points()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(clicked.map((d) => d.id)).toEqual([42]);
  });

  it('grows a point and shows its tooltip on focus', () => {
    builder.buildChart(elm, config(), PcacLineAreaPlotChartConfigType.Plot);

    points()[0].focus();

    expect(document.querySelector<HTMLElement>('.pcac-d3-tooltip')?.style.display).toBe('inline-block');
    points()[0].blur();
    expect(document.querySelector<HTMLElement>('.pcac-d3-tooltip')?.style.display).toBe('none');
  });

  it('moves the Tab stop off a point zoom has carried out of the plot', () => {
    builder.buildChart(elm, config({ enableZoomX: true }), PcacLineAreaPlotChartConfigType.Plot);
    expect(points()[0].getAttribute('tabindex')).toBe('0');

    // 4x, panned to the right-hand end of the domain: the point at x = 10 is out of view.
    const zoom = (builder as unknown as { zoomBehavior: ZoomBehavior<Element, unknown> }).zoomBehavior;
    const onZoom = zoom.on('zoom') as (event: { transform: typeof zoomIdentity }) => void;
    onZoom({ transform: zoomIdentity.translate(-3 * builder.width, 0).scale(4) });

    expect(points()[0].getAttribute('display')).toBe('none');
    expect(points()[1].getAttribute('tabindex')).toBe('0');
  });

  it('hides the axes and grid from screen readers', () => {
    builder.buildChart(elm, config(), PcacLineAreaPlotChartConfigType.Line);

    for (const part of elm.nativeElement.querySelectorAll('.pcac-x-axis, .pcac-y-axis, .pcac-grid')) {
      expect(part.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
