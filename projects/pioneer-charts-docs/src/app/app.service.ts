import { inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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

  pieChartConfig = toSignal(this.repository.getPieChartConfig(), { initialValue: new PcacPieChartConfig() });
  sharedConfig = toSignal(this.repository.getShareConfig(), { initialValue: [] as PcacData[] });

  barVerticalChartConfig = toSignal(this.repository.getBarVerticalChart(), { initialValue: new PcacBarVerticalChartConfig() });
  barVerticalChartSingleConfig = toSignal(this.repository.getBarVerticalChartSingle(), { initialValue: new PcacBarVerticalChartConfig() });
  barVerticalChartGroupConfig = toSignal(this.repository.getBarVerticalChartGroup(), { initialValue: new PcacBarVerticalChartConfig() });
  barVerticalChartStackedConfig = toSignal(this.repository.getBarVerticalChartStacked(), { initialValue: new PcacBarVerticalChartConfig() });

  barHorizontalChartConfig = toSignal(this.repository.getBarHorizontalChart(), { initialValue: new PcacBarHorizontalChartConfig() });
  barHorizontalChartSingleConfig = toSignal(this.repository.getBarHorizontalChartSingle(), { initialValue: new PcacBarHorizontalChartConfig() });
  barHorizontalChartGroupConfig = toSignal(this.repository.getBarHorizontalChartGroup(), { initialValue: new PcacBarHorizontalChartConfig() });
  barHorizontalChartStackedConfig = toSignal(this.repository.getBarHorizontalChartStacked(), { initialValue: new PcacBarHorizontalChartConfig() });

  lineChartConfig = toSignal(this.repository.getLineChart(), { initialValue: new PcacLineChartConfig() });
  areaChartConfig = toSignal(this.repository.getAreaChart(), { initialValue: new PcacAreaChartConfig() });
  areaChartHideConfig = toSignal(this.repository.getAreaHideChart(), { initialValue: new PcacAreaChartConfig() });
  plotConfig = toSignal(this.repository.getPlotChart(), { initialValue: new PcacPlotChartConfig() });

  legendConfig = toSignal(this.repository.getLegendConfig(), { initialValue: new PcacLegendConfig() });

  onClicked(data: PcacData) {
    alert(`Key: ${data.key} - Value: ${data.value}`);
  }
}
