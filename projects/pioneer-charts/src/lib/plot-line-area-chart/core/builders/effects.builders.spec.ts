import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacData } from '../../../core/chart.model';

/**
 * jsdom doesn't implement SVGGeometryElement's real geometry methods (getTotalLength() etc.) -
 * stub deterministic ones directly on the element, same technique real browsers just do natively.
 */
function pathWithGeometry(className: string, length: number): SVGPathElement {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('class', className);
  Object.defineProperty(path, 'getTotalLength', { value: () => length, configurable: true });
  Object.defineProperty(path, 'getPointAtLength', { value: (l: number) => ({ x: l, y: 0 }), configurable: true });
  return path;
}

function sampleData(): PcacData[] {
  return [{ key: '', value: 0, hide: false, data: [{ key: 0, value: 1, hide: false, data: [] }] }];
}

describe('PlaChartEffectsBuilder', () => {
  let svgRoot: SVGGElement;

  beforeEach(() => {
    svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
    document.body.appendChild(svgRoot);
  });

  afterEach(() => {
    document.body.removeChild(svgRoot);
  });

  // Regression test: PlaChartBuilder.drawArea() (used for type: 'area') draws <path class="area">,
  // never <path class="line"> — that's only drawLine() (type: 'line'). buildEffects() used to
  // collect geometry by selecting '.line' unconditionally, so an area-type chart with
  // enableEffects: true left its internal `lines` array empty, and the first mousemove threw
  // "Cannot read properties of undefined (reading 'getTotalLength')" hovering it.
  //
  // Asserts real positioning, not just "doesn't throw": updateEffects()'s own defensive guard for
  // Plot-type charts (see below) would silently no-op an area chart here too if the selector
  // regressed back to '.line' alone, without ever throwing — that guard is a fallback for charts
  // with no connecting geometry at all, not a substitute for finding an area chart's own path.
  it('positions the crosshair correctly hovering an area-type chart (only a .area path, no .line)', () => {
    svgRoot.appendChild(pathWithGeometry('area', 100));

    const builder = new PlaChartEffectsBuilder();
    const scale = scaleLinear().domain([0, 100]).range([0, 100]);
    builder.buildEffects({
      svg: select(svgRoot),
      height: 100,
      width: 100,
      data: sampleData(),
      colors: ['red'],
      x: scale,
      y: scale,
    });

    const canvas = svgRoot.querySelector('.effects-canvas')!;
    expect(() => canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))).not.toThrow();

    const effectGroup = svgRoot.querySelector('.effect-group')!;
    expect(effectGroup.getAttribute('transform')).toMatch(/^translate\(/);
  });

  it('does not throw hovering a plot-type chart (neither a .line nor a .area path)', () => {
    // PlaChartBuilder.drawLineArea() only draws for type Line/Area; a Plot-type chart draws
    // neither, so `lines` is empty even after the fix above — updateEffects()'s per-group guard
    // (not the selector) is what has to hold here.
    const builder = new PlaChartEffectsBuilder();
    const scale = scaleLinear().domain([0, 100]).range([0, 100]);
    builder.buildEffects({
      svg: select(svgRoot),
      height: 100,
      width: 100,
      data: sampleData(),
      colors: ['red'],
      x: scale,
      y: scale,
    });

    const canvas = svgRoot.querySelector('.effects-canvas')!;
    expect(() => canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }))).not.toThrow();
  });

  it('still positions the crosshair correctly for a line-type chart', () => {
    svgRoot.appendChild(pathWithGeometry('line', 100));

    const builder = new PlaChartEffectsBuilder();
    const scale = scaleLinear().domain([0, 100]).range([0, 100]);
    builder.buildEffects({
      svg: select(svgRoot),
      height: 100,
      width: 100,
      data: sampleData(),
      colors: ['red'],
      x: scale,
      y: scale,
    });

    const canvas = svgRoot.querySelector('.effects-canvas')!;
    canvas.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));

    const effectGroup = svgRoot.querySelector('.effect-group')!;
    expect(effectGroup.getAttribute('transform')).toMatch(/^translate\(/);
  });
});
