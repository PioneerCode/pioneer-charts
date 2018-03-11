import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITableConfig } from '../pcac/table/table.model';

@Injectable()
export class PcacRepository {

  constructor(private http: HttpClient) { }

  getTable() {
    return this.http.get<ITableConfig>('./assets/mock/table.json');
  }

  getBarChart() {
    return this.http.get<ITableConfig>('./assets/mock/bar-chart.json');
  }

  getLineAreaChart() {
    return this.http.get<ITableConfig>('./assets/mock/line-area-chart.json');
  }
}
