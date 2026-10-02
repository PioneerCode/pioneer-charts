import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PcacDotPlotChart, PcacDotPlotChartConfig } from '@pioneer-code/pioneer-charts';
import { AppService } from '../../app.service';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';

/** The settings the "Try it" controls edit. `binWidth` 0 means none: only equal values stack. */
interface DotPlotSettings {
  binWidth: number;
  images: boolean;
  autoTickSize: boolean;
  /** `pointImage`'s box, both sides. */
  imageSize: number;
}

@Component({
  selector: 'pc-dot-plot-chart',
  templateUrl: './dot-plot-chart.component.html',
  imports: [
    ChartCard,
    ChartContract,
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    RouterLink,
    PcacDotPlotChart,
    LayoutResourceState,
  ]
})
export class DotPlotChartComponent {
  pcService = inject(AppService);

  jumpNav = signal<IJumpNav[]>([
    { key: 'Dot Plot Chart', value: 'dot-plot-chart' },
    { key: 'Try it', value: 'try-it' },
    { key: 'Showing the drawn size', value: 'drawn-size' },
    { key: 'Markup', value: 'markup' },
    { key: 'API', value: 'api' },
    { key: 'Configuration', value: 'configuration' },
    { key: 'Events', value: 'events' },
  ]);

  protected readonly binWidths = [0, 1, 2, 5];
  protected readonly settings = signal<DotPlotSettings>({ binWidth: 2, images: true, autoTickSize: false, imageSize: 22 });

  /** The chart's last `markFit`: 1 while the marks fit at full size. */
  protected readonly fit = signal(1);
  protected readonly drawnSize = computed(() => Math.floor(this.settings().imageSize * this.fit()));

  /** Same pattern as the Axis Styling page: a fresh config object so the chart rebuilds. */
  protected readonly config = computed<PcacDotPlotChartConfig>(() => {
    const { binWidth, images, autoTickSize, imageSize } = this.settings();
    const mock = this.pcService.dotPlotChartConfig.value();
    return {
      ...mock,
      xAxis: { ...mock.xAxis, autoTickSize },
      binWidth: binWidth || undefined,
      pointImage: { maxWidth: imageSize, maxHeight: imageSize },
      // Without images, each point falls back to a dot in its series' color.
      data: images ? mock.data : mock.data.map(series => ({
        ...series,
        data: series.data.map(({ image: _image, ...point }) => point),
      })),
      ariaLabel: 'Daily highs in June, by sky',
    };
  });

  protected set<K extends keyof DotPlotSettings>(field: K, value: DotPlotSettings[K]): void {
    this.settings.update((settings) => ({ ...settings, [field]: value }));
  }

  /** The demo's own config, as code - so the sample always matches the chart above it. */
  protected readonly configCode = computed(() => {
    const { binWidth, images, autoTickSize, imageSize } = this.settings();
    return `const config: PcacDotPlotChartConfig = {
  // Series, each holding its points: value = position on the axis, key = its name.
  data: [
    { key: 'Sunny', value: null, hide: false, data: [
      { key: 'June 1', value: 81, hide: false, data: []${images ? `, image: 'sun.svg'` : ''} },
      ...
    ] },
    ...
  ],
  xAxis: { domainMin: 50, domainMax: 90, label: 'Daily high (°F)', showGrid: true${autoTickSize ? ', autoTickSize: true' : ''} },${binWidth ? `\n  binWidth: ${binWidth},` : ''}${images ? `\n  pointImage: { maxWidth: ${imageSize}, maxHeight: ${imageSize} },` : ''}
};`;
  });

  drawnSizeCode = `// The pick drives the chart; the slider shows what was drawn.
readonly pickedSize = signal(40);
readonly shownSize = signal(40);

readonly config = computed<PcacDotPlotChartConfig>(() => {
  const size = this.pickedSize();
  return { ...base, pointImage: { maxWidth: size, maxHeight: size } };
});

// The slider: [value]="shownSize()" (input)="pick(...)"
pick(size: number): void {
  this.pickedSize.set(size);
  // markFit only emits on a change: assume it fits until told.
  this.shownSize.set(size);
}

// The chart: (markFit)="onMarkFit($event)"
onMarkFit(fit: number): void {
  this.shownSize.set(Math.floor(this.pickedSize() * fit));
}`;

  markupCode = `<pcac-dot-plot-chart [config]="config" (dotClicked)="onClicked($event)" />`;
  importCode = `import { PcacDotPlotChart, PcacDotPlotChartConfig } from '@pioneer-code/pioneer-charts';`;
}
