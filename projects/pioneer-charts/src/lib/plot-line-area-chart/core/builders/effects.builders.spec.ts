import { select } from 'd3-selection';
import { scaleLinear } from 'd3-scale';
import { PlaChartEffectsBuilder } from './effects.builders';
import { PcacData, PcacFormatEnum } from '../../../core/chart.model';

const point = (value: PcacData['value'], key: PcacData['key'] = ''): PcacData => ({ key, value, hide: false, data: [] });
const series = (key: string, data: PcacData[]): PcacData => ({ key, value: 0, hide: false, data });

describe('PlaChartEffectsBuilder', () => {
  let svgRoot: SVGGElement;

  beforeEach(() => {
    svgRoot = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
    document.body.appendChild(svgRoot);
  });

  afterEach(() => {
    document.body.removeChild(svgRoot);
  });

  /**
   * Builds the effects over a 100x100 plot whose y axis runs 0-100 (so a value's pixel is
   * `100 - value`) and whose x axis positions points by index across `xDomain`.
   */
  function build(data: PcacData[], options: { xDomain?: [number, number]; colors?: string[]; yFormat?: PcacFormatEnum; yDomain?: [number, number] } = {}) {
    const builder = new PlaChartEffectsBuilder();
    builder.buildEffects({
      svg: select(svgRoot),
      height: 100,
      width: 100,
      data,
      colors: options.colors ?? ['red', 'green', 'blue'],
      x: scaleLinear().domain(options.xDomain ?? [0, 4]).range([0, 100]),
      y: scaleLinear().domain(options.yDomain ?? [0, 100]).range([100, 0]),
      xFormat: PcacFormatEnum.DatasetLength,
      yFormat: options.yFormat,
      yTicks: 5,
    });
    return builder;
  }

  function hover(x: number): void {
    const event = new MouseEvent('mousemove', { bubbles: true });
    Object.defineProperty(event, 'offsetX', { value: x });
    Object.defineProperty(event, 'offsetY', { value: 0 });
    svgRoot.querySelector('.effects-canvas')!.dispatchEvent(event);
  }

  const groups = () => Array.from(svgRoot.querySelectorAll<SVGGElement>('.effect-group'));
  const text = (group: SVGGElement) => group.querySelector('text')!.textContent;

  it('marks the value interpolated between the points either side of the cursor', () => {
    build([series('a', [point(0), point(40), point(80), point(60), point(20)])]);

    hover(37.5); // halfway between index 1 (x 25, 40) and index 2 (x 50, 80)

    expect(groups()[0].getAttribute('transform')).toBe('translate(37.5,40)');
    expect(text(groups()[0])).toBe('60');
  });

  // Regression test: the crosshair used to find its point by binary-searching the drawn path's
  // geometry for the cursor's x. An area's outline runs along the top, then back along the
  // baseline, so near the right edge of an area falling to the right the search landed on the
  // way back and read the left end's value.
  it('reads the right value near the right edge of a series falling to the right', () => {
    build([series('a', [point(90), point(70), point(50), point(30), point(10)])]);

    hover(90); // between index 3 (x 75, 30) and index 4 (x 100, 10)

    expect(text(groups()[0])).toBe('18');
    expect(groups()[0].getAttribute('transform')).toBe('translate(90,82)');
  });

  it('holds the first or last value beyond the ends of the series', () => {
    build([series('a', [point(10), point(20), point(30)])], { xDomain: [0, 4] });

    hover(90); // past the last point (index 2, x 50)
    expect(text(groups()[0])).toBe('30');

    hover(0);
    expect(text(groups()[0])).toBe('10');
  });

  it('hides the mark over a gap in the series, where no line is drawn', () => {
    build([series('a', [point(10), point(null), point(30), point(40), point(50)])]);

    hover(12.5);
    expect(groups()[0].getAttribute('visibility')).toBe('hidden');

    hover(62.5);
    expect(groups()[0].getAttribute('visibility')).toBeNull();
    expect(text(groups()[0])).toBe('35');
  });

  it('follows the scales handed over by a zoom', () => {
    const builder = build([series('a', [point(0), point(40), point(80), point(60), point(20)])]);
    builder.updateScales(scaleLinear().domain([0, 2]).range([0, 100]), scaleLinear().domain([0, 100]).range([100, 0]));

    hover(50); // index 1 on the zoomed x scale

    expect(text(groups()[0])).toBe('40');
  });

  // Regression test: effect groups skip empty series, and each used to be colored by its position
  // among the non-empty ones rather than by its series - so every group after an empty series
  // took the previous series' color.
  it('pairs each effect group with its own series and color when an empty series sits between them', () => {
    build([
      series('a', [point(10), point(10)]),
      series('b', []),
      series('c', [point(30), point(30)]),
    ]);

    hover(10);

    expect(groups().length).toBe(2);
    expect(text(groups()[0])).toBe('10');
    expect(text(groups()[1])).toBe('30');
    expect(groups().map((g) => g.querySelector('circle')!.style.stroke)).toEqual(['red', 'blue']);
  });

  // Regression test: the crosshair's value was always rounded to a whole number, so a 0-1 axis
  // only ever read 0 or 1, and the y axis's format (e.g. Percentage) was ignored.
  describe('crosshair value', () => {
    const hoverAt = (value: number, yFormat?: PcacFormatEnum) => {
      build([series('a', [point(value), point(value)])], { yFormat, yDomain: [0, 1] });
      hover(10);
      return text(groups()[0]);
    };

    it('keeps the precision of the y axis ticks', () => {
      expect(hoverAt(0.6)).toBe('0.6');
    });

    it('reads like the y axis in its format', () => {
      expect(hoverAt(0.6, PcacFormatEnum.Percentage)).toBe('60%');
    });
  });
});
