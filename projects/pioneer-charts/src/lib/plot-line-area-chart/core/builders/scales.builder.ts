
import { scaleTime } from 'd3';
import { ScaleLinear, scaleLinear, ScaleTime } from 'd3-scale';


import { PcacLineAreaChartConfig } from '../../plot-line-area-chart.model';
import { PcacFormatEnum } from '../../../core/chart.model';

export class PlaChartScales {
  x!: ScaleLinear<number, number> | ScaleTime<number, number, never>;
  y!: ScaleLinear<number, number>;
}

export class PlaChartScalesBuilder {
  build(config: PcacLineAreaChartConfig, chartWidth: number, chartHeight: number): PlaChartScales {
    let resp = new PlaChartScales();
    resp.x = this.buildXScale(config, chartWidth);
    resp.y = this.buildYScale(config, chartHeight);
    return resp;
  }

  private buildXScale(config: PcacLineAreaChartConfig, chartWidth: number): ScaleLinear<number, number> | ScaleTime<number, number, never> {
    let resp: ScaleLinear<number, number> | ScaleTime<number, number, never>;

    switch (config.xFormat) {
      case PcacFormatEnum.DateTime:
        resp = scaleTime()
          .domain([new Date(config.xDomainMin), new Date(config.xDomainMax)])
          .range([0, chartWidth]);
        break;
      case PcacFormatEnum.Decimal:
        resp = scaleLinear()
          .domain([config.xDomainMin as number || 0, config.xDomainMax as number || 100])
          .range([0, chartWidth]);
        break;
      case PcacFormatEnum.DatasetLength:
        resp = scaleLinear()
          .domain([0, config.data[0].data.length - 1])
          .range([0, chartWidth]);
        break;
      default:
        resp = scaleLinear()
          .domain([0, config.data[0].data.length - 1])
          .range([0, chartWidth]);
        break;
    }

    return resp;
  }

  private buildYScale(config: PcacLineAreaChartConfig, chartHeight: number): ScaleLinear<number, number> {
    return scaleLinear()
      .domain([config.yDomainMin as number || 0, config.yDomainMax as number || 100])
      .range([chartHeight, 0]);
  }
}
