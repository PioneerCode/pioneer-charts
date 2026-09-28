import { inject, Injectable, Injector, runInInjectionContext, untracked } from '@angular/core';
import { httpResource, HttpResourceRef } from '@angular/common/http';
import { AppRepository } from './app.repository';
import type { PcacAreaChartConfig, PcacBarHorizontalChartConfig, PcacBarVerticalChartConfig, PcacData, PcacDotPlotChartConfig, PcacLegendConfig, PcacLineChartConfig, PcacPieChartConfig, PcacPlotChartConfig } from '@pioneer-code/pioneer-charts';

/**
 * What each chart shows while its mock loads: no data (so it draws nothing) at the default height.
 * Plain objects rather than `new PcacPieChartConfig()` and friends, so this root service (part of the app shell)
 * only imports the library's *types* - importing its classes pulled the whole library, and d3,
 * into the initial bundle, though every page that draws a chart is lazy-loaded.
 */
function emptyConfig<T>(): T {
  return { data: [], height: 200 } as unknown as T;
}

/**
 * One mock chart config, fetched from its JSON file the first time something reads it - not when
 * the app starts. Every page used to request all twenty mocks (this service is root-level and the
 * header and footer inject it), so each pre-rendered page carried all of them, ~53KB, in its
 * transfer state; now a page carries only the mocks it shows.
 *
 * `value()` never throws: it's the empty default until the mock loads, and stays the default if
 * the request fails. (An `httpResource` in its error state throws from `value()`, and a page
 * reading many of them in its template stopped rendering at the first failed one - taking the
 * "Couldn't load chart data" overlay with it.) `isLoading()`/`error()` feed that overlay
 * (LayoutResourceState).
 */
export class MockConfig<T> {
  private ref?: HttpResourceRef<T>;

  constructor(
    private readonly injector: Injector,
    private readonly url: () => string,
    private readonly fallback: T,
  ) {}

  readonly value = (): T => {
    const ref = this.resource();
    return ref.hasValue() ? ref.value() : this.fallback;
  };

  readonly isLoading = (): boolean => this.resource().isLoading();

  readonly error = (): unknown => this.resource().error();

  // Created on first read, which is usually during a template or computed: `untracked` so creating
  // it there isn't treated as part of that reactive read (Angular refuses to set up a resource's
  // effect inside one).
  private resource(): HttpResourceRef<T> {
    return this.ref ??= untracked(() => runInInjectionContext(this.injector, () =>
      httpResource<T>(this.url, { defaultValue: this.fallback })));
  }
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly repository = inject(AppRepository);
  private readonly injector = inject(Injector);

  private mock<T>(url: () => string, fallback: T = emptyConfig<T>()): MockConfig<T> {
    return new MockConfig<T>(this.injector, url, fallback);
  }

  pieChartConfig = this.mock<PcacPieChartConfig>(() => this.repository.getPieChartConfigUrl());

  dotPlotChartConfig = this.mock<PcacDotPlotChartConfig>(() => this.repository.getDotPlotChartUrl());

  barVerticalChartConfig = this.mock<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartUrl());
  barVerticalChartSingleConfig = this.mock<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartSingleUrl());
  barVerticalChartGroupConfig = this.mock<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartGroupUrl());
  barVerticalChartStackedConfig = this.mock<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartStackedUrl());

  barHorizontalChartConfig = this.mock<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartUrl());
  barHorizontalChartSingleConfig = this.mock<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartSingleUrl());
  barHorizontalChartGroupConfig = this.mock<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartGroupUrl());
  barHorizontalChartStackedConfig = this.mock<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartStackedUrl());

  lineChartConfig = this.mock<PcacLineChartConfig>(() => this.repository.getLineChartUrl());
  areaChartConfig = this.mock<PcacAreaChartConfig>(() => this.repository.getAreaChartUrl());
  areaChartHideConfig = this.mock<PcacAreaChartConfig>(() => this.repository.getAreaHideChartUrl());
  lineChartImagesConfig = this.mock<PcacLineChartConfig>(() => this.repository.getLineChartImagesUrl());
  lineChartZoomConfig = this.mock<PcacLineChartConfig>(() => this.repository.getLineChartZoomUrl());
  areaChartImagesConfig = this.mock<PcacAreaChartConfig>(() => this.repository.getAreaChartImagesUrl());
  plotConfig = this.mock<PcacPlotChartConfig>(() => this.repository.getPlotChartUrl());
  plotImagesConfig = this.mock<PcacPlotChartConfig>(() => this.repository.getPlotChartImagesUrl());
  plotFanOutConfig = this.mock<PcacPlotChartConfig>(() => this.repository.getPlotChartFanOutUrl());
  plotRangeConfig = this.mock<PcacPlotChartConfig>(() => this.repository.getPlotChartRangeUrl());

  legendConfig = this.mock<PcacLegendConfig>(() => this.repository.getLegendConfigUrl(), { heading: null, items: [] });

  onClicked(data: PcacData) {
    alert(`Key: ${data.key} - Value: ${data.value}`);
  }
}
