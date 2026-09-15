
import { scaleTime } from 'd3';
import { ScaleLinear, scaleLinear, ScaleTime } from 'd3-scale';


import { PcacData, PcacFormatEnum, PcacResolvedAxisConfig } from '../../../core/chart.model';

export class PlaChartScales {
  x!: ScaleLinear<number, number> | ScaleTime<number, number, never>;
  y!: ScaleLinear<number, number>;
}

/**
 * Takes the chart's *resolved* axes (`PcacChart.xAxis`/`yAxis`), not the raw config, so the
 * `format`/`domainMin`/`domainMax` defaults are already applied - see `PcacLineAreaChartConfig`
 * for what each format does with them.
 */
export class PlaChartScalesBuilder {
  build(
    xAxis: PcacResolvedAxisConfig, yAxis: PcacResolvedAxisConfig, data: PcacData[], chartWidth: number, chartHeight: number
  ): PlaChartScales {
    const resp = new PlaChartScales();
    resp.x = this.buildXScale(xAxis, data, chartWidth);
    resp.y = this.buildYScale(yAxis, chartHeight);
    return resp;
  }

  private buildXScale(
    xAxis: PcacResolvedAxisConfig, data: PcacData[], chartWidth: number
  ): ScaleLinear<number, number> | ScaleTime<number, number, never> {
    switch (xAxis.format) {
      case PcacFormatEnum.DateTime:
        return scaleTime()
          .domain([new Date(xAxis.domainMin), new Date(xAxis.domainMax)])
          .range([0, chartWidth]);
      case PcacFormatEnum.Decimal:
        return scaleLinear()
          .domain([xAxis.domainMin as number, xAxis.domainMax as number])
          .range([0, chartWidth]);
      default:
        // DatasetLength and every other format position points by index
        return scaleLinear()
          .domain([0, data[0].data.length - 1])
          .range([0, chartWidth]);
    }
  }

  private buildYScale(yAxis: PcacResolvedAxisConfig, chartHeight: number): ScaleLinear<number, number> {
    return scaleLinear()
      .domain([yAxis.domainMin as number, yAxis.domainMax as number])
      .range([chartHeight, 0]);
  }
}
