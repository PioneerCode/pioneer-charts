import { IPcacChartConfig } from '../core/chart.model';

export interface IPcacTableConfig extends IPcacChartConfig {
  enableStickyHeader: boolean;
  enableStickyFooter: boolean;
  actionColumnConfig: IPcacTableActionColumnConfig;
}

export interface IPcacTableActionColumnConfig {
  enable: boolean;
  enableEdit: boolean;
  enableDelete: boolean;
  enableSelect: boolean;
}

export interface IPcacTableHeader  {
  key: string;
  value: string | number;
  icon: PcacTableSortIconsEnum;
}

export enum PcacTableSortIconsEnum {
  Sort = 'fa fa-sort',
  SortAsc = 'fa fa-sort-asc',
  SortDesc = 'fa fa-sort-desc'
}
