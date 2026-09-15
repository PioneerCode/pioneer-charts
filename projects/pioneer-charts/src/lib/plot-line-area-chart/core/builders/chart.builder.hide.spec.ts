import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';
import { PcacData } from '../../../core/chart.model';

/** Same technique as chart.builder.point-image.spec.ts: a real jsdom `<svg>` with a stubbed parent `clientWidth`. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function series(key: string, hide: boolean): PcacData {
  return { key, value: null, hide, data: [{ key: 0, value: 10, hide: false, data: [] }, { key: 1, value: 20, hide: false, data: [] }] };
}

function config(): PcacLineAreaChartConfig {
  return {
    ...new PcacLineAreaChartConfig(),
    enableEffects: false,
    enableZoom: false,
    xAxis: { domainMin: 0, domainMax: 100 },
    yAxis: { domainMin: 0, domainMax: 100 },
    data: [series('shown', false), series('hidden', true)],
  };
}

// Regression test: drawLine() and drawDots() honored a series' `hide`, but drawArea() didn't -
// the hidden series' dots disappeared while its fill stayed painted.
describe('PlaChartBuilder series hide', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
  });

  function displayOf(type: PcacLineAreaPlotChartConfigType, selector: string): (string | null)[] {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm();
    builder.buildChart(elm, config(), type);
    return Array.from(elm.nativeElement.querySelectorAll(selector) as NodeListOf<SVGElement>).map((el) => el.style.display || null);
  }

  it('hides a hidden series\' area', () => {
    expect(displayOf(PcacLineAreaPlotChartConfigType.Area, '.area')).toEqual([null, 'none']);
  });

  it('hides a hidden series\' dots (both chart types)', () => {
    expect(displayOf(PcacLineAreaPlotChartConfigType.Area, '.dots')).toEqual([null, 'none']);
    expect(displayOf(PcacLineAreaPlotChartConfigType.Line, '.dots')).toEqual([null, 'none']);
  });
});
