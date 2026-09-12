import { computed, inject, Injectable } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { AppRepository } from './app.repository';
import { PcacAreaChartConfig, PcacBarHorizontalChartConfig, PcacBarVerticalChartConfig, PcacData, PcacLegendConfig, PcacLineChartConfig, PcacPieChartConfig, PcacPlotChartConfig } from '@pioneer-code/pioneer-charts';


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

  pieChartConfig = httpResource<PcacPieChartConfig>(() => this.repository.getPieChartConfigUrl(), { defaultValue: new PcacPieChartConfig() });

  barVerticalChartConfig = httpResource<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartUrl(), { defaultValue: new PcacBarVerticalChartConfig() });
  barVerticalChartSingleConfig = httpResource<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartSingleUrl(), { defaultValue: new PcacBarVerticalChartConfig() });
  barVerticalChartGroupConfig = httpResource<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartGroupUrl(), { defaultValue: new PcacBarVerticalChartConfig() });
  barVerticalChartStackedConfig = httpResource<PcacBarVerticalChartConfig>(() => this.repository.getBarVerticalChartStackedUrl(), { defaultValue: new PcacBarVerticalChartConfig() });

  barHorizontalChartConfig = httpResource<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartUrl(), { defaultValue: new PcacBarHorizontalChartConfig() });
  barHorizontalChartSingleConfig = httpResource<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartSingleUrl(), { defaultValue: new PcacBarHorizontalChartConfig() });
  barHorizontalChartGroupConfig = httpResource<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartGroupUrl(), { defaultValue: new PcacBarHorizontalChartConfig() });
  barHorizontalChartStackedConfig = httpResource<PcacBarHorizontalChartConfig>(() => this.repository.getBarHorizontalChartStackedUrl(), { defaultValue: new PcacBarHorizontalChartConfig() });

  lineChartConfig = httpResource<PcacLineChartConfig>(() => this.repository.getLineChartUrl(), { defaultValue: new PcacLineChartConfig() });
  areaChartConfig = httpResource<PcacAreaChartConfig>(() => this.repository.getAreaChartUrl(), { defaultValue: new PcacAreaChartConfig() });
  areaChartHideConfig = httpResource<PcacAreaChartConfig>(() => this.repository.getAreaHideChartUrl(), { defaultValue: new PcacAreaChartConfig() });
  lineChartImagesConfig = httpResource<PcacLineChartConfig>(() => this.repository.getLineChartImagesUrl(), { defaultValue: new PcacLineChartConfig() });
  areaChartImagesConfig = httpResource<PcacAreaChartConfig>(() => this.repository.getAreaChartImagesUrl(), { defaultValue: new PcacAreaChartConfig() });
  plotConfig = httpResource<PcacPlotChartConfig>(() => this.repository.getPlotChartUrl(), { defaultValue: new PcacPlotChartConfig() });
  plotImagesConfig = httpResource<PcacPlotChartConfig>(() => this.repository.getPlotChartImagesUrl(), { defaultValue: new PcacPlotChartConfig() });

  legendConfig = httpResource<PcacLegendConfig>(() => this.repository.getLegendConfigUrl(), { defaultValue: new PcacLegendConfig() });

  onClicked(data: PcacData) {
    alert(`Key: ${data.key} - Value: ${data.value}`);
  }
}
