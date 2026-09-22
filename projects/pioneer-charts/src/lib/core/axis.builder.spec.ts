import { TestBed } from '@angular/core/testing';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { IPcacAxisBuilderConfig, PcacAxisBuilder } from './axis.builder';
import { PcacAxisConfig, PcacFormatEnum, resolveAxisConfig } from './chart.model';

/**
 * d3-axis needs nothing jsdom lacks - it only appends <g>/<path>/<line>/<text> and sets
 * attributes - so these run against a real (detached) `<svg><g>` with no geometry stubs.
 */
type AxisSvg = Selection<SVGGElement, unknown, BaseType, unknown>;

function svgGroup(): AxisSvg {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  svg.appendChild(g);
  return select(g);
}

function axisConfig(xAxis: PcacAxisConfig = {}, yAxis: PcacAxisConfig = {}): IPcacAxisBuilderConfig<number, number> {
  return {
    svg: svgGroup(),
    width: 200,
    height: 100,
    margin: { top: 8, right: 16, bottom: 38, left: 58 },
    xScale: scaleLinear().domain([0, 100]).range([0, 200]),
    yScale: scaleLinear().domain([0, 100]).range([100, 0]),
    xAxis: resolveAxisConfig(xAxis),
    yAxis: resolveAxisConfig(yAxis),
  };
}

/**
 * d3-axis encodes the inner tick length on each `.tick line` as `x2` (left axis, negated) or `y2`
 * (bottom axis), and the outer end-caps as the domain `<path>`'s leading/trailing segments.
 */
function tickLineLengths(g: AxisSvg, axisClass: string, attr: 'x2' | 'y2'): number[] {
  return g.selectAll<SVGLineElement, unknown>(`.${axisClass} .tick line`).nodes()
    .map(line => Number(line.getAttribute(attr)));
}

function domainPath(g: AxisSvg, axisClass: string): string {
  return g.select(`.${axisClass} .domain`).attr('d');
}

describe('PcacAxisBuilder tick size', () => {
  let builder: PcacAxisBuilder;

  beforeEach(() => {
    builder = TestBed.inject(PcacAxisBuilder);
  });

  it('draws D3-default 6px ticks when no size is given', () => {
    const config = axisConfig();
    builder.drawAxis(config);

    expect(tickLineLengths(config.svg, 'pcac-x-axis', 'y2')).not.toHaveLength(0);
    expect(new Set(tickLineLengths(config.svg, 'pcac-x-axis', 'y2'))).toEqual(new Set([6]));
    expect(new Set(tickLineLengths(config.svg, 'pcac-y-axis', 'x2'))).toEqual(new Set([-6]));
  });

  // The theme hides tick marks unless the axis opts in with this class; the geometry above is
  // only visible once it's there.
  it('marks an axis as showing tick marks only when a size is given for it', () => {
    const none = axisConfig();
    builder.drawAxis(none);
    expect(none.svg.select('.pcac-x-axis').classed('pcac-axis-tick-marks')).toBe(false);
    expect(none.svg.select('.pcac-y-axis').classed('pcac-axis-tick-marks')).toBe(false);

    const xOnly = axisConfig({ tickSize: 6 });
    builder.drawAxis(xOnly);
    expect(xOnly.svg.select('.pcac-x-axis').classed('pcac-axis-tick-marks')).toBe(true);
    expect(xOnly.svg.select('.pcac-y-axis').classed('pcac-axis-tick-marks')).toBe(false);
  });

  it('marks an axis as showing its line only when asked, independently per axis', () => {
    const none = axisConfig();
    builder.drawAxis(none);
    expect(none.svg.select('.pcac-x-axis').classed('pcac-axis-line')).toBe(false);
    expect(none.svg.select('.pcac-y-axis').classed('pcac-axis-line')).toBe(false);

    const yOnly = axisConfig({ showLine: false }, { showLine: true });
    builder.drawAxis(yOnly);
    expect(yOnly.svg.select('.pcac-x-axis').classed('pcac-axis-line')).toBe(false);
    expect(yOnly.svg.select('.pcac-y-axis').classed('pcac-axis-line')).toBe(true);
    // the line is D3's domain path, which is always drawn; the class is what un-hides it
    expect(yOnly.svg.select('.pcac-y-axis .domain').empty()).toBe(false);
  });

  it('skips a hidden axis entirely, per axis', () => {
    const config = axisConfig({ hide: true }, {});
    builder.drawAxis(config);
    expect(config.svg.select('.pcac-x-axis').empty()).toBe(true);
    expect(config.svg.select('.pcac-y-axis').empty()).toBe(false);
  });

  // Regression test: a Decimal x axis used a fixed `.2s` (two significant digits), so once zoom
  // narrowed the domain to a few units the ticks rounded onto one another - `10 11 12 12`.
  describe('Decimal tick labels', () => {
    const labels = (config: IPcacAxisBuilderConfig<number, number>) =>
      config.svg.selectAll<SVGTextElement, unknown>('.pcac-x-axis .tick text').nodes().map((t) => t.textContent);

    it('take their precision from the tick step, so a zoomed-in axis has no repeated labels', () => {
      const config = axisConfig({ format: PcacFormatEnum.Decimal, ticks: 6 });
      config.xScale = scaleLinear().domain([9.1, 12.4]).range([0, 200]);
      builder.drawXAxis(config);
      expect(labels(config)).toEqual(['9.5', '10', '10.5', '11', '11.5', '12']);
    });

    it('stay compact on a whole domain, with an SI prefix for thousands', () => {
      const config = axisConfig({ format: PcacFormatEnum.Decimal, ticks: 6 });
      builder.drawXAxis(config);
      expect(labels(config)).toEqual(['0', '20', '40', '60', '80', '100']);

      const big = axisConfig({ format: PcacFormatEnum.Decimal, ticks: 6 });
      big.xScale = scaleLinear().domain([0, 2000]).range([0, 200]);
      builder.drawXAxis(big);
      expect(labels(big)).toEqual(['0', '0.5k', '1k', '1.5k', '2k']);
    });
  });

  // The theme reads each colored part through a `--pcac-axis-*-color` custom property with its own
  // color as the fallback, so "override" means the property is on the axis group and "no override"
  // means it isn't - an inline `stroke`/`fill` would instead be on the elements.
  describe('color overrides', () => {
    const prop = (config: IPcacAxisBuilderConfig<number, number>, axisClass: string, name: string) =>
      (config.svg.select<SVGGElement>(`.${axisClass}`).node()!).style.getPropertyValue(name);

    it('puts each given color on that axis\'s group as a custom property', () => {
      const config = axisConfig(
        { tickColor: 'red', tickLabelColor: 'pink', lineColor: 'blue', labelColor: 'green', subLabelColor: 'purple' },
        { tickColor: 'orange' }
      );
      builder.drawAxis(config);
      expect(prop(config, 'pcac-x-axis', '--pcac-axis-tick-color')).toBe('red');
      expect(prop(config, 'pcac-x-axis', '--pcac-axis-tick-label-color')).toBe('pink');
      expect(prop(config, 'pcac-x-axis', '--pcac-axis-line-color')).toBe('blue');
      expect(prop(config, 'pcac-x-axis', '--pcac-axis-label-color')).toBe('green');
      expect(prop(config, 'pcac-x-axis', '--pcac-axis-sub-label-color')).toBe('purple');
      // per axis: the y axis only got a tick color
      expect(prop(config, 'pcac-y-axis', '--pcac-axis-tick-color')).toBe('orange');
      expect(prop(config, 'pcac-y-axis', '--pcac-axis-line-color')).toBe('');
    });

    it('sets nothing when no color is given, so the theme\'s fallbacks apply', () => {
      const config = axisConfig();
      builder.drawAxis(config);
      expect(config.svg.select('.pcac-x-axis').attr('style')).toBeNull();
      expect(config.svg.select('.pcac-y-axis').attr('style')).toBeNull();
    });

    it('leaves the elements themselves unstyled - the theme still decides what shows', () => {
      const config = axisConfig({ tickColor: 'red', tickLabelColor: 'pink', lineColor: 'blue' });
      builder.drawAxis(config);
      expect(config.svg.select('.pcac-x-axis .tick line').attr('style')).toBeNull();
      // d3-axis's own `fill="currentColor"` stays; the theme rule is what reads the property
      expect(config.svg.select('.pcac-x-axis .tick text').attr('style')).toBeNull();
      expect(config.svg.select('.pcac-x-axis .tick text').attr('fill')).toBe('currentColor');
      expect(config.svg.select('.pcac-x-axis .domain').attr('style')).toBeNull();
      // a color alone doesn't turn the marks / line on
      expect(config.svg.select('.pcac-x-axis').classed('pcac-axis-tick-marks')).toBe(false);
      expect(config.svg.select('.pcac-x-axis').classed('pcac-axis-line')).toBe(false);
    });
  });

  it('uses each axis\'s own tick count', () => {
    const config = axisConfig({ ticks: 2 }, { ticks: 10 });
    builder.drawAxis(config);
    // D3 treats the count as a hint; a [0,100] domain gives exactly these
    expect(config.svg.selectAll('.pcac-x-axis .tick').size()).toBe(3);
    expect(config.svg.selectAll('.pcac-y-axis .tick').size()).toBe(11);
  });

  it('draws a label centered along each axis, hugging the chart edge, only when given', () => {
    const none = axisConfig();
    builder.drawAxis(none);
    expect(none.svg.selectAll('.pcac-axis-label').size()).toBe(0);

    const config = axisConfig({ label: 'Day' }, { label: 'Revenue' });
    builder.drawAxis(config);
    const x = config.svg.select('.pcac-x-axis .pcac-axis-label');
    expect(x.text()).toBe('Day');
    expect(Number(x.attr('x'))).toBe(100);   // width / 2
    expect(Number(x.attr('y'))).toBe(38);    // margin.bottom, baseline pulled up by dy
    const y = config.svg.select('.pcac-y-axis .pcac-axis-label');
    expect(y.text()).toBe('Revenue');
    expect(y.attr('transform')).toBe('rotate(-90)');
    expect(Number(y.attr('x'))).toBe(-50);   // -height / 2
    expect(Number(y.attr('y'))).toBe(-58);   // -margin.left
    // d3-axis puts fill="none" on the group, so the text has to bring its own
    expect(x.attr('fill')).toBe('currentColor');
    expect(y.attr('fill')).toBe('currentColor');
  });

  it('places sub labels at the start, middle and end of each axis, anchored inside its span', () => {
    // margin.bottom 38 = 20 + label 18; no sub-label space in the fixture margin, but placement
    // only depends on where the row's outer edge is
    const config = axisConfig({ subLabels: { min: 'Low', mid: 'Med', max: 'High' } }, { subLabels: { min: 'Cold', max: 'Hot' } });
    builder.drawAxis(config);

    const x = config.svg.selectAll<SVGTextElement, unknown>('.pcac-x-axis .pcac-axis-sub-label').nodes()
      .map(n => [n.textContent, Number(n.getAttribute('x')), n.getAttribute('text-anchor'), Number(n.getAttribute('y'))]);
    // no label on x, so the row sits at the margin edge
    expect(x).toEqual([['Low', 0, 'start', 38], ['Med', 100, 'middle', 38], ['High', 200, 'end', 38]]);

    const y = config.svg.selectAll<SVGTextElement, unknown>('.pcac-y-axis .pcac-axis-sub-label').nodes()
      .map(n => [n.textContent, Number(n.getAttribute('x')), n.getAttribute('text-anchor'), Number(n.getAttribute('y')), n.getAttribute('transform')]);
    // rotated: min at the bottom (x = -height), max at the top (x = 0); only the two given
    expect(y).toEqual([['Cold', -100, 'start', -58, 'rotate(-90)'], ['Hot', 0, 'end', -58, 'rotate(-90)']]);
  });

  it('moves the sub label row inside the axis label when both are set', () => {
    const config = axisConfig({ label: 'Day', subLabels: { mid: 'Med' } });
    builder.drawAxis(config);
    expect(Number(config.svg.select('.pcac-x-axis .pcac-axis-label').attr('y'))).toBe(38);
    expect(Number(config.svg.select('.pcac-x-axis .pcac-axis-sub-label').attr('y'))).toBe(38 - 18);
  });

  it('does not draw a label or sub labels for a hidden axis', () => {
    const config = axisConfig({ hide: true, label: 'Day', subLabels: { min: 'Low' } });
    builder.drawAxis(config);
    expect(config.svg.selectAll('.pcac-axis-label, .pcac-axis-sub-label').size()).toBe(0);
  });

  it('raiseAxes moves both axes after content drawn later, without taking mouse events', () => {
    const config = axisConfig();
    builder.drawAxis(config);
    config.svg.append('path').attr('class', 'line');
    config.svg.append('rect').attr('class', 'overlay');

    builder.raiseAxes(config.svg);

    const order = config.svg.selectAll<SVGElement, unknown>(':scope > *').nodes().map(n => n.getAttribute('class'));
    expect(order).toEqual(['line', 'overlay', 'pcac-x-axis', 'pcac-y-axis']);
    expect(config.svg.select('.pcac-x-axis').attr('pointer-events')).toBe('none');
    expect(config.svg.select('.pcac-y-axis').attr('pointer-events')).toBe('none');
  });

  it('applies each axis\'s tickSize independently', () => {
    const config = axisConfig({ tickSize: 12 }, { tickSize: 3 });
    builder.drawAxis(config);

    expect(new Set(tickLineLengths(config.svg, 'pcac-x-axis', 'y2'))).toEqual(new Set([12]));
    expect(new Set(tickLineLengths(config.svg, 'pcac-y-axis', 'x2'))).toEqual(new Set([-3]));
  });

  // `0` is meaningful (no tick marks), so the builder must not treat it as "unset" via `||`.
  it('honors a 0 tick size rather than falling back to the default', () => {
    const config = axisConfig({ tickSize: 0 }, { tickSize: 0 });
    builder.drawAxis(config);

    expect(new Set(tickLineLengths(config.svg, 'pcac-x-axis', 'y2'))).toEqual(new Set([0]));
    expect(new Set(tickLineLengths(config.svg, 'pcac-y-axis', 'x2'))).toEqual(new Set([-0]));
  });

  it('leaves the outer end-caps of the domain line at their default', () => {
    const defaults = axisConfig();
    const custom = axisConfig({ tickSize: 20 }, { tickSize: 20 });
    builder.drawAxis(defaults);
    builder.drawAxis(custom);

    expect(domainPath(custom.svg, 'pcac-x-axis')).toBe(domainPath(defaults.svg, 'pcac-x-axis'));
    expect(domainPath(custom.svg, 'pcac-y-axis')).toBe(domainPath(defaults.svg, 'pcac-y-axis'));
  });

  it('keeps the tick size on a zoom-driven x-axis redraw', () => {
    const config = axisConfig({ tickSize: 10 });
    builder.drawAxis(config);
    builder.drawXAxis({ ...config, xScale: scaleLinear().domain([20, 60]).range([0, 200]) });

    // drawXAxis removes the previous x axis before appending, so exactly one remains
    expect(config.svg.selectAll('.pcac-x-axis').size()).toBe(1);
    expect(new Set(tickLineLengths(config.svg, 'pcac-x-axis', 'y2'))).toEqual(new Set([10]));
  });
});
