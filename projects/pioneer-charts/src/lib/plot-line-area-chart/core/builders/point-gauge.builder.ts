import { Selection } from 'd3-selection';
import { arc } from 'd3-shape';
import { PcacData } from '../../../core/chart.model';
import { PcacPointGaugeConfig } from '../../plot-line-area-chart.model';

/** A hovered dot's radius - the largest a dot gets, so a ring around it never touches it. */
export const GAUGE_DOT_RADIUS = 6;

/** Whether a point has a gauge value to draw. */
export function hasGauge(d: PcacData): boolean {
  return typeof d.gauge === 'number' && Number.isFinite(d.gauge);
}

/** How far a ring reaches past the mark it surrounds: its gap plus its full width. */
export function gaugeExtent(config: PcacPointGaugeConfig): number {
  return config.gap + config.width;
}

/** The share of the ring a value fills, clamped to 0 - 1. A `max` of 0 or less fills nothing. */
export function gaugeFraction(value: number, max: number): number {
  return max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
}

/**
 * Appends a `.point-gauge` ring to each point in `points` that has a `gauge`: a `.point-gauge-track`
 * circle (unless `showTrack` is off) and a `.point-gauge-arc` path filling clockwise from 12
 * o'clock. `markRadius` is half of what the ring surrounds - the image box, or a hovered dot - so
 * the ring's centerline sits `gap + width / 2` beyond it. Returned so the caller can place the
 * rings (see `drawDots`, which moves them with each point's fan-out offset and enter rise).
 */
export function drawPointGauges(
  points: Selection<SVGGElement, PcacData, SVGGElement, unknown>,
  config: PcacPointGaugeConfig,
  markRadius: (d: PcacData) => number,
): Selection<SVGGElement, PcacData, SVGGElement, unknown> {
  const radius = (d: PcacData) => markRadius(d) + config.gap + config.width / 2;
  const gauges = points.filter(hasGauge)
    .append('g')
    .attr('class', 'point-gauge')
    .attr('aria-hidden', 'true');
  if (config.showTrack) {
    gauges.append('circle')
      .attr('class', 'point-gauge-track')
      .attr('r', radius)
      .attr('stroke-width', config.width);
  }
  gauges.append('path')
    .attr('class', 'point-gauge-arc')
    .attr('d', (d: PcacData) => {
      const fraction = gaugeFraction(d.gauge as number, config.max);
      if (fraction === 0) {
        return null;
      }
      const r = radius(d);
      // Rounded ends read as a gauge; a full ring has no ends to round.
      return arc().cornerRadius(fraction < 1 ? config.width / 2 : 0)({
        innerRadius: r - config.width / 2,
        outerRadius: r + config.width / 2,
        startAngle: 0,
        endAngle: 2 * Math.PI * fraction,
      });
    });
  return gauges;
}
