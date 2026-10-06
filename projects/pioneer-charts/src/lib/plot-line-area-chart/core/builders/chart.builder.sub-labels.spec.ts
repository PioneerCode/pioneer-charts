import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacPlotChartConfig } from '../../plot/plot.model';
import { PcacFormatEnum } from '../../../core/chart.model';
import { PCAC_SUB_LABEL_AFTER } from '../../../core/axis.builder';

/** Same technique as chart.builder.point-image.spec.ts. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function config(extra: Partial<PcacPlotChartConfig> = {}): PcacPlotChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoomX: true,
    enableZoomY: false,
    xAxis: { format: PcacFormatEnum.Decimal, domainMin: 0, domainMax: 100, subLabels: { min: 'Low', mid: 'Med', max: 'High' } },
    yAxis: { domainMin: 0, domainMax: 100 },
    colorOverride: [],
    data: [{ key: 'series', value: null, hide: false, data: [{ key: 50, value: 50, hide: false, data: [] }] }],
    ...extra,
  };
}

/** Same technique as chart.builder.zoom.spec.ts: drive the zoom callback directly with a real transform. */
function zoomTo(builder: PlaChartBuilder, transform: typeof zoomIdentity): void {
  const zoom = (builder as unknown as { zoomBehavior: ZoomBehavior<Element, unknown> }).zoomBehavior;
  const onZoom = zoom.on('zoom') as (event: { transform: typeof zoomIdentity }) => void;
  onZoom({ transform });
}

function subLabels(svg: SVGSVGElement): [string | null, number, boolean][] {
  return Array.from(svg.querySelectorAll('.pcac-x-axis .pcac-axis-sub-label')).map(n =>
    [n.textContent, Number(n.getAttribute('x')), n.classList.contains('pcac-axis-sub-label-out-of-view')]);
}

describe('PlaChartBuilder axis sub labels', () => {
  let builder: PlaChartBuilder;
  let elm: ElementRef;
  let width: number;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    elm = chartElm(800);
    builder.buildChart(elm, config(), PcacLineAreaPlotChartConfigType.Plot);
    width = (builder as unknown as { width: number }).width;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('puts them at the start, middle and end before any zoom', () => {
    expect(subLabels(elm.nativeElement)).toEqual([['Low', 0, false], ['Med', width / 2, false], ['High', width, false]]);
  });

  it('keeps them with their values through a zoom, and through a rebuild that keeps it', () => {
    // 2x on x, the left edge kept: 0 - 50 in view, so 'Med' (50) is at the right edge and 'High' (100) past it
    const zoomed = [['Low', 0, false], ['Med', width, false], ['High' + PCAC_SUB_LABEL_AFTER, width, true]];
    zoomTo(builder, zoomIdentity.scale(2));
    expect(subLabels(elm.nativeElement)).toEqual(zoomed);

    builder.buildChart(elm, config(), PcacLineAreaPlotChartConfigType.Plot);
    expect(subLabels(elm.nativeElement)).toEqual(zoomed);
  });
});
