import { Selection, BaseType } from 'd3-selection';
import { ScaleLinear } from 'd3-scale';
import { IPcacData } from '../core';
import { Injectable } from '@angular/core';
import { select } from 'd3-selection';
import { ScaleTime } from 'd3';

export interface ILineAreaChartEffectsBuilderConfig {
  colors: string[];
  data: IPcacData[];
  width: number;
  height: number;
  svg: Selection<BaseType, {}, HTMLElement, any>;
  x: ScaleLinear<number, number> | ScaleTime<number, number, never>;
  y: ScaleLinear<number, number> | ScaleTime<number, number, never>;
}

@Injectable({
  providedIn: 'root',
})
export class LineAreaChartEffectsBuilder {
  private config!: ILineAreaChartEffectsBuilderConfig;
  private lines = [] as any[];

  buildEffects(config: ILineAreaChartEffectsBuilderConfig): void {
    this.config = config;
    this.lines = [] as any[];
    this.config.svg.selectAll('.line').each((d, i, n) => {
      this.lines.push(n[i]);
    });
    this.buildCollection();
    this.buildCanvas();
  }

  private buildCollection() {
    const collection = this.config.svg.append('g')
      .attr('class', 'effects');

    collection.append('path')
      .attr('class', 'effect-line');

    const mousePerLine = collection.selectAll('.effect-group')
      .data(this.config.data.filter((elm) => {
        return elm.data.length > 0;
      }))
      .enter().append('g')
      .attr('class', 'effect-group')
      .attr('style', (d: IPcacData) => d.hide ? 'display: none' : null);

    mousePerLine.append('circle')
      .attr('r', 7)
      .attr('class', 'effect-circle')
      .style('stroke', (d: IPcacData, i: number) => {
        return this.config.colors[i];
      });

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
    this.config.svg.selectAll('.effect-group')
      .attr('transform', (data, index: number, nodes: any) => {
        let beginning = 0;
        let end = this.lines[index].getTotalLength();
        let target = 0;
        let pos;

        while (true) {
          target = Math.floor((beginning + end) / 2);
          pos = this.lines[index].getPointAtLength(target);
          if ((target === end || target === beginning) && pos.x !== mousePos[0]) {
            break;
          }

          if (pos.x > mousePos[0]) {
            end = target;
          } else if (pos.x < mousePos[0]) {
            beginning = target;
          } else {
            break;
          }
        }

        let textTarget = this.config.y.invert(pos.y) as number
        select(nodes[index]).select('text')
          .text(textTarget.toFixed(0));

        return 'translate(' + mousePos[0] + ',' + pos.y + ')';
      });
  }
}
