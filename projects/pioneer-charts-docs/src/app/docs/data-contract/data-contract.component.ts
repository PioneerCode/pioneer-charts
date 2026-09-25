import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

@Component({
  selector: 'pc-data-contract',
  templateUrl: './data-contract.component.html',
  imports: [
    RouterLink,
    LayoutCode,
    LayoutPageDocs
  ]
})
export class DataContractComponent {
  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Data Contract',
      value: 'data-contract',
    },
    {
      key: 'PcacData',
      value: 'data',
    },
    {
      key: 'PcacChartConfig',
      value: 'chart-config',
    },
    {
      key: 'New Chart Config',
      value: 'new-chart-config',
    },
    {
      key: 'Binding Configuration',
      value: 'map',
    }
  ])

  data = `export class PcacData {
  key: string | number | null = null;
  value: string | number | null = null;
  /**
   * Hides an item while keeping its place in the color order. On a
   * line/area/plot series: its line/area, points and hover effects aren't
   * drawn. On a bar, or a whole bar group: drawn at zero size, keeping its
   * slot. On a pie slice: given no angle.
   */
  hide: boolean = false;
  data: PcacData[] = [];
  /**
   * Line/area/plot charts only, on a point: URL (or data URI) of an
   * image to draw in place of its dot, sized by the config's pointImage.
   */
  image?: string;
}`;

  baseConfig = `export class PcacChartConfig {
  data: PcacData[] = [];
  /** Height in pixels. */
  height: number = 200;
  /** If true, height is a minimum and the chart fills a taller container. */
  heightFull?: boolean = false;
}

/** Every chart with axes (bar, line, area, plot - not pie) extends this instead. */
export class PcacAxisChartConfig extends PcacChartConfig {
  xAxis?: PcacAxisConfig = new PcacAxisConfig();
  yAxis?: PcacAxisConfig = new PcacAxisConfig();
}`;

  barChartConfig = `export class PcacBarVerticalChartConfig extends PcacAxisChartConfig {
  isStacked: boolean = false;
  thresholds: PcacData[] = [];
  spreadColorsPerGroup: boolean = false;
  colorOverride: PcacBarVerticalChartColorOverrideConfig = new PcacBarVerticalChartColorOverrideConfig();
}`;

  bindConfig = `<pcac-bar-vertical-chart [config]="config" />`;

  typing = `// Spread the class's defaults so an object literal only has to name what it changes.
const config: PcacBarVerticalChartConfig = { ...new PcacBarVerticalChartConfig(), data, isStacked: true };

// Or build one with new and assign to it.
const config = new PcacBarVerticalChartConfig();
config.data = data;`;
}
