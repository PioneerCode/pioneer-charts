import { inject, Injectable, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { AppRepository } from './app.repository';
import { PcacAreaChartConfig, PcacBarHorizontalChartConfig, PcacBarVerticalChartConfig, PcacData, PcacLegendConfig, PcacLineChartConfig, PcacPieChartConfig, PcacPlotChartConfig } from '@pioneer-code/pioneer-charts';


export enum MainRoutes {
  HOME = 'home',
  GET_STARTED = 'get-started',
  CHARTS = 'charts',
  API = 'api'
}

@Injectable({
  providedIn: 'root',
})
export class AppService {
  private readonly repository = inject(AppRepository);

  mainRoute = signal<MainRoutes>(MainRoutes.HOME);

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
  plotConfig = httpResource<PcacPlotChartConfig>(() => this.repository.getPlotChartUrl(), { defaultValue: new PcacPlotChartConfig() });

  legendConfig = httpResource<PcacLegendConfig>(() => this.repository.getLegendConfigUrl(), { defaultValue: new PcacLegendConfig() });

  onClicked(data: PcacData) {
    alert(`Key: ${data.key} - Value: ${data.value}`);
  }
}
