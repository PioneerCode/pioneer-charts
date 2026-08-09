import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacLineAreaChartConfig, PcacLineAreaPlotChartConfigType } from '../../plot-line-area-chart.model';

/** Same technique as core/chart.spec.ts: a real jsdom `<svg>` with a stubbed parent `clientWidth`. */
function chartElm(width = 800): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  document.body.appendChild(parent);
  return { nativeElement: svg } as ElementRef;
}

function config(): PcacLineAreaChartConfig {
  return {
    height: 200,
    enableEffects: false,
    enableZoom: false,
    numberOfTicks: 5,
    hideGrid: false,
    hideAxis: false,
    yFormat: undefined as unknown as PcacLineAreaChartConfig['yFormat'],
    xFormat: undefined as unknown as PcacLineAreaChartConfig['xFormat'],
    yDomainMax: 100,
    yDomainMin: 0,
    xDomainMin: 0,
    xDomainMax: 100,
    colorOverride: [],
    data: [
      { key: '', value: null, hide: false, data: [{ key: 0, value: 1, hide: false, data: [] }, { key: 1, value: 2, hide: false, data: [] }] },
    ],
  };
}

// Regression test: dots at the x-domain's minimum or maximum sit exactly on the chart's
// clip-path boundary (a <rect> spanning [0, width]) - since a dot has a nonzero radius, half of
// it (left half at the minimum, right half at the maximum) used to fall outside that boundary
// and get clipped away. The vertical dimension already carries a 10px buffer on each side for
// the identical reason (see the .attr('y', -10)/.attr('height', height + 20) below it); the
// horizontal dimension needs the same treatment.
describe('PlaChartBuilder clip-path', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [PlaChartEffectsBuilder] });
  });

  it('extends the clip-path rect horizontally beyond [0, width], matching its existing vertical buffer', () => {
    const builder = TestBed.runInInjectionContext(() => new PlaChartBuilder());
    const elm = chartElm(800);
    builder.buildChart(elm, config(), PcacLineAreaPlotChartConfigType.Line);

    const clipRect = elm.nativeElement.querySelector('clipPath rect')!;
    const x = Number(clipRect.getAttribute('x'));
    const width = Number(clipRect.getAttribute('width'));
    const y = Number(clipRect.getAttribute('y'));
    const height = Number(clipRect.getAttribute('height'));

    expect(x).toBeLessThan(0);
    expect(width).toBeGreaterThan(builder.width);
    // The rect's right edge (x + width) must clear the chart's full drawable width, not just be
    // wider in the abstract - a positive x with an unchanged width would still clip the right edge.
    expect(x + width).toBeGreaterThan(builder.width);

    // Same buffer amount on both axes, mirroring the vertical treatment this was modeled on.
    const horizontalBuffer = -x;
    const verticalBuffer = -y;
    expect(horizontalBuffer).toBe(verticalBuffer);
    expect(width - builder.width).toBe(height - builder.height);
  });
});
