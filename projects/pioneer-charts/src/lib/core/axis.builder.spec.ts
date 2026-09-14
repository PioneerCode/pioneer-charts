import { TestBed } from '@angular/core/testing';
import { scaleLinear } from 'd3-scale';
import { BaseType, select, Selection } from 'd3-selection';
import { IPcacAxisBuilderConfig, PcacAxisBuilder } from './axis.builder';

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

function axisConfig(overrides: Partial<IPcacAxisBuilderConfig<number, number>> = {}): IPcacAxisBuilderConfig<number, number> {
  return {
    svg: svgGroup(),
    height: 100,
    xScale: scaleLinear().domain([0, 100]).range([0, 200]),
    yScale: scaleLinear().domain([0, 100]).range([100, 0]),
    numberOfTicks: 5,
    ...overrides,
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

    const xOnly = axisConfig({ xTickSize: 6 });
    builder.drawAxis(xOnly);
    expect(xOnly.svg.select('.pcac-x-axis').classed('pcac-axis-tick-marks')).toBe(true);
    expect(xOnly.svg.select('.pcac-y-axis').classed('pcac-axis-tick-marks')).toBe(false);
  });

  it('applies xTickSize and yTickSize independently', () => {
    const config = axisConfig({ xTickSize: 12, yTickSize: 3 });
    builder.drawAxis(config);

    expect(new Set(tickLineLengths(config.svg, 'pcac-x-axis', 'y2'))).toEqual(new Set([12]));
    expect(new Set(tickLineLengths(config.svg, 'pcac-y-axis', 'x2'))).toEqual(new Set([-3]));
  });

  // `0` is meaningful (no tick marks), so the builder must not treat it as "unset" via `||`.
  it('honors a 0 tick size rather than falling back to the default', () => {
    const config = axisConfig({ xTickSize: 0, yTickSize: 0 });
    builder.drawAxis(config);

    expect(new Set(tickLineLengths(config.svg, 'pcac-x-axis', 'y2'))).toEqual(new Set([0]));
    expect(new Set(tickLineLengths(config.svg, 'pcac-y-axis', 'x2'))).toEqual(new Set([-0]));
  });

  it('leaves the outer end-caps of the domain line at their default', () => {
    const defaults = axisConfig();
    const custom = axisConfig({ xTickSize: 20, yTickSize: 20 });
    builder.drawAxis(defaults);
    builder.drawAxis(custom);

    expect(domainPath(custom.svg, 'pcac-x-axis')).toBe(domainPath(defaults.svg, 'pcac-x-axis'));
    expect(domainPath(custom.svg, 'pcac-y-axis')).toBe(domainPath(defaults.svg, 'pcac-y-axis'));
  });

  it('keeps the tick size on a zoom-driven x-axis redraw', () => {
    const config = axisConfig({ xTickSize: 10 });
    builder.drawAxis(config);
    builder.drawXAxis({ ...config, xScale: scaleLinear().domain([20, 60]).range([0, 200]) });

    // drawXAxis removes the previous x axis before appending, so exactly one remains
    expect(config.svg.selectAll('.pcac-x-axis').size()).toBe(1);
    expect(new Set(tickLineLengths(config.svg, 'pcac-x-axis', 'y2'))).toEqual(new Set([10]));
  });
});
