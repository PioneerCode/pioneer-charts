import { Selection, BaseType } from 'd3-selection';
import { ScaleLinear, ScaleTime } from 'd3-scale';
import { PcacData, PcacFormatEnum } from '../../../core';
import { axisTickFormat } from '../../../core/tick-format';
import { Injectable } from '@angular/core';
import { select } from 'd3-selection';
import { getXFormat } from '../x-format';
import { hasValue } from './has-value';

export interface IPlaChartEffectsBuilderConfig {
  colors: string[];
  data: PcacData[];
  width: number;
  height: number;
  svg: Selection<SVGGElement, unknown, BaseType, unknown>;
  x: ScaleLinear<number, number> | ScaleTime<number, number, never>;
  y: ScaleLinear<number, number> | ScaleTime<number, number, never>;
  /** The x axis's format, so the crosshair positions points the way the lines do (`getXFormat`). */
  xFormat: PcacFormatEnum;
  /** The y axis's format and tick count, so the crosshair's value reads like the axis labels. */
  yFormat?: PcacFormatEnum;
  yTicks?: number;
}

/**
 * Provided per-component (see PcacLineAreaChartComponent's `providers`), not root-scoped: this
 * holds mutable per-chart-instance state (`config`, `series`) despite looking like a stateless
 * helper. A root singleton would be shared and clobbered by every `<pcac-line-area-chart>`
 * rendered at once — each instance's hover effects would end up reading/writing whichever
 * chart's `buildEffects()` ran last, not their own.
 */
@Injectable()
export class PlaChartEffectsBuilder {
  private config!: IPlaChartEffectsBuilderConfig;
  // The series that get an effect group, each with its index in `config.data` (which is what its
  // line's color is picked by, so a skipped empty series doesn't shift the colors after it).
  private series: { data: PcacData; index: number }[] = [];

  buildEffects(config: IPlaChartEffectsBuilderConfig): void {
    this.config = config;
    this.series = config.data
      .map((data, index) => ({ data, index }))
      .filter(({ data }) => data.data.length > 0);
    this.buildCollection();
    this.buildCanvas();
  }

  /**
   * Swaps in the scales a zoom has rescaled. The crosshair positions and labels its points
   * against the scales, so a zoom has to hand them over here or it would track the unzoomed
   * lines.
   */
  updateScales(x: IPlaChartEffectsBuilderConfig['x'], y: IPlaChartEffectsBuilderConfig['y']): void {
    this.config.x = x;
    this.config.y = y;
  }

  private buildCollection() {
    const collection = this.config.svg.append('g')
      .attr('class', 'effects');

    collection.append('path')
      .attr('class', 'effect-line');

    const mousePerLine = collection.selectAll('.effect-group')
      .data(this.series)
      .enter().append('g')
      .attr('class', 'effect-group')
      .attr('style', ({ data }) => data.hide ? 'display: none' : null);

    mousePerLine.append('circle')
      .attr('r', 7)
      .attr('class', 'effect-circle')
      .style('stroke', ({ index }) => this.config.colors[index]);

    mousePerLine.append('text')
      .attr('class', 'effect-text')
      .attr('y', 1.5)
      .attr('transform', 'translate(10,3)');
  }

  private buildCanvas(): void {
    this.config.svg.append('rect')
      .attr('class', 'effects-canvas')
      .attr('width', this.config.width)
      .attr('height', this.config.height)
      .attr('pointer-events', 'all')
      .on('mouseout', () => {
        this.hideEffects();
      })
      .on('mouseover', () => {
        this.showEffects();
      })
      .on('mousemove', (event: MouseEvent) => {
        const current = event.currentTarget as Element
        const parent = current.parentElement
        const xForms = parent?.getAttribute('transform')
        if(!xForms)  
          return  this.onMouseMove([event.offsetX, event.offsetY]);
        
        const parts  = /translate\(\s*([^\s,)]+)[ ,]([^\s,)]+)/.exec(xForms);
        if(!parts)  
          return  this.onMouseMove([event.offsetX, event.offsetY]);
        const x = Number(parts[1])
        this.onMouseMove([event.offsetX - x, event.offsetY]);
      });
  }

  private showEffects() {
    this.config.svg.select('.effect-line')
      .style('opacity', '1');
    this.config.svg.selectAll('.effect-group circle')
      .style('opacity', '1');
    this.config.svg.selectAll('.effect-group text')
      .style('opacity', '1');
  }

  private hideEffects() {
    this.config.svg.select('.effect-line')
      .style('opacity', '0');
    this.config.svg.selectAll('.effect-group circle')
      .style('opacity', '0');
    this.config.svg.selectAll('.effect-group text')
      .style('opacity', '0');
  }

  private onMouseMove(mousePos: [number, number]) {
    this.updateLine(mousePos);
    this.updateEffects(mousePos);
  }

  private updateLine(mousePos: [number, number]) {
    this.config.svg.select('.effect-line')
      .attr('d', () => 'M' + mousePos[0] + ',' + this.config.height + ' ' + mousePos[0] + ',' + 0);
  }

  private updateEffects(mousePos: [number, number]) {
    this.config.svg.selectAll<SVGGElement, { data: PcacData }>('.effect-group')
      .each((series, index, nodes) => {
        const group = select(nodes[index]);
        const value = this.valueAt(series.data.data, mousePos[0]);
        // No value under the cursor (a gap in the series): nothing to mark, so the group is
        // hidden rather than left at its last position.
        group.attr('visibility', value === null ? 'hidden' : null);
        if (value === null) {
          return;
        }
        group.attr('transform', 'translate(' + mousePos[0] + ',' + this.config.y(value) + ')');
        group.select('text').text(this.formatValue(value));
      });
  }

  /**
   * The series' value at plot x `mouseX`, interpolated between the two points either side of it
   * the same way the (linear) line/area joins them - or null if it falls in a gap, where the
   * line isn't drawn. Beyond the first/last point it holds that point's value.
   *
   * Worked out from the data rather than by walking the drawn path: an area's outline doubles
   * back along its baseline, so a search over the path's geometry could land on the bottom edge
   * and read the wrong value.
   */
  private valueAt(points: PcacData[], mouseX: number): number | null {
    const xAt = (i: number) => getXFormat(this.config.xFormat, points[i], i, this.config.x);
    const drawn = points.map((_, i) => i).filter((i) => hasValue(points[i]));
    if (!drawn.length) {
      return null;
    }
    const first = drawn[0];
    const last = drawn[drawn.length - 1];
    if (mouseX <= xAt(first)) {
      return Number(points[first].value);
    }
    if (mouseX >= xAt(last)) {
      return Number(points[last].value);
    }
    for (let n = 1; n < drawn.length; n++) {
      const [a, b] = [drawn[n - 1], drawn[n]];
      const [xa, xb] = [xAt(a), xAt(b)];
      if (mouseX > xb) {
        continue;
      }
      // Points with no value between the two break the line (`defined(hasValue)`).
      if (b - a > 1) {
        return null;
      }
      const [va, vb] = [Number(points[a].value), Number(points[b].value)];
      return xb === xa ? vb : va + (vb - va) * (mouseX - xa) / (xb - xa);
    }
    return null;
  }

  /**
   * The crosshair's value, formatted the way the y axis labels its ticks - same format, same
   * step-based precision - rather than rounded to a whole number, which read a 0-1 axis as 0 or 1.
   */
  private formatValue(value: number): string {
    const y = this.config.y as ScaleLinear<number, number>;
    const formatter = axisTickFormat(this.config.yFormat, y, this.config.yTicks)
      ?? y.tickFormat(this.config.yTicks);
    return formatter(value);
  }
}
