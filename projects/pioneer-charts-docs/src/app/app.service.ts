import { computed, inject, Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AppRepository } from './app.repository';
import type { PcacAreaChartConfig, PcacBarHorizontalChartConfig, PcacBarVerticalChartConfig, PcacData, PcacLegendConfig, PcacLineChartConfig, PcacPieChartConfig, PcacPlotChartConfig } from '@pioneer-code/pioneer-charts';

/**
 * What each chart shows while its mock loads: no data (so it draws nothing) at the default height.
 * Plain objects rather than `new PcacPieChartConfig()` and friends, so this eagerly loaded service
 * only imports the library's *types* - importing its classes pulled the whole library, and d3,
 * into the initial bundle, though every page that draws a chart is lazy-loaded.
 */
function emptyConfig<T>(): T {
  return { data: [], height: 200 } as unknown as T;
}


export enum MainRoutes {
  HOME = 'home',
  CHARTS = 'charts',
  API = 'api'
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly repository = inject(AppRepository);
  private readonly router = inject(Router);

  // Derived from the Router's own navigation events rather than set manually by individual
  // (click) handlers - correctly reflects whichever top-level section (home / docs / charts) the
  // current URL belongs to regardless of how the user got there (a direct/deep link, the header's
  // nav buttons, the docs sidebar, browser back/forward - not just a click on one of the footer's
  // own three links, which is all the previous manually-set version ever actually covered).
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  mainRoute = computed<MainRoutes | null>(() => {
    const url = this.currentUrl();
    if (url === '/') {
      return MainRoutes.HOME;
    }
    if (url.startsWith('/docs')) {
      return MainRoutes.API;
    }
    if (url.startsWith('/charts')) {
      return MainRoutes.CHARTS;
    }
    return null;
  });

  pieChartConfig = httpResource<PcacPieChartConfig>(() => this.repository.getPieChartConfigUrl(), { defaultValue: emptyConfig<PcacPieChartConfig>() });

  barVerticalChartConfig = httpResource<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartUrl(), { defaultValue: emptyConfig<PcacBarVerticalChartConfig>() });
  barVerticalChartSingleConfig = httpResource<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartSingleUrl(), { defaultValue: emptyConfig<PcacBarVerticalChartConfig>() });
  barVerticalChartGroupConfig = httpResource<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartGroupUrl(), { defaultValue: emptyConfig<PcacBarVerticalChartConfig>() });
  barVerticalChartStackedConfig = httpResource<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartStackedUrl(), { defaultValue: emptyConfig<PcacBarVerticalChartConfig>() });

  barHorizontalChartConfig = httpResource<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartUrl(), { defaultValue: emptyConfig<PcacBarHorizontalChartConfig>() });
  barHorizontalChartSingleConfig = httpResource<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartSingleUrl(), { defaultValue: emptyConfig<PcacBarHorizontalChartConfig>() });
  barHorizontalChartGroupConfig = httpResource<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartGroupUrl(), { defaultValue: emptyConfig<PcacBarHorizontalChartConfig>() });
  barHorizontalChartStackedConfig = httpResource<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartStackedUrl(), { defaultValue: emptyConfig<PcacBarHorizontalChartConfig>() });

  lineChartConfig = httpResource<PcacLineChartConfig>(() => this.repository.getLineChartUrl(), { defaultValue: emptyConfig<PcacLineChartConfig>() });
  areaChartConfig = httpResource<PcacAreaChartConfig>(() => this.repository.getAreaChartUrl(), { defaultValue: emptyConfig<PcacAreaChartConfig>() });
  areaChartHideConfig = httpResource<PcacAreaChartConfig>(() => this.repository.getAreaHideChartUrl(), { defaultValue: emptyConfig<PcacAreaChartConfig>() });
  lineChartImagesConfig = httpResource<PcacLineChartConfig>(() => this.repository.getLineChartImagesUrl(), { defaultValue: emptyConfig<PcacLineChartConfig>() });
  lineChartZoomConfig = httpResource<PcacLineChartConfig>(() => this.repository.getLineChartZoomUrl(), { defaultValue: emptyConfig<PcacLineChartConfig>() });
  areaChartImagesConfig = httpResource<PcacAreaChartConfig>(() => this.repository.getAreaChartImagesUrl(), { defaultValue: emptyConfig<PcacAreaChartConfig>() });
  plotConfig = httpResource<PcacPlotChartConfig>(() => this.repository.getPlotChartUrl(), { defaultValue: emptyConfig<PcacPlotChartConfig>() });
  plotImagesConfig = httpResource<PcacPlotChartConfig>(() => this.repository.getPlotChartImagesUrl(), { defaultValue: emptyConfig<PcacPlotChartConfig>() });
  plotFanOutConfig = httpResource<PcacPlotChartConfig>(() => this.repository.getPlotChartFanOutUrl(), { defaultValue: emptyConfig<PcacPlotChartConfig>() });
  plotRangeConfig = httpResource<PcacPlotChartConfig>(() => this.repository.getPlotChartRangeUrl(), { defaultValue: emptyConfig<PcacPlotChartConfig>() });

  legendConfig = httpResource<PcacLegendConfig>(() => this.repository.getLegendConfigUrl(), { defaultValue: { heading: null, items: [] } });

  onClicked(data: PcacData) {
    alert(`Key: ${data.key} - Value: ${data.value}`);
  }
}
