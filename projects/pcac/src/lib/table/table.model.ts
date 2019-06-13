import { IPcacChartConfig } from '../core/chart.model';

export interface IPcacTableConfig extends IPcacChartConfig {
  enableStickyHeader: boolean;
  enableStickyFooter: boolean;

  /**
   * Show or hide edit icon
   */
  enableEditAction: boolean;

  /**
   * Show or hide delete icon
   */
  enableDeleteAction: boolean;

  /**
   * Show or hide history icon
   */
  enableHistoryAction: boolean;

  hideColumnOne: boolean;
}

export interface IPcacTableHeader  {
  key: string;
  value: string | number;
  icon: PcacTableSortIconsEnum;
}

export enum PcacTableSortIconsEnum {
  Sort = 'pcac-icon pcac-icon-sort',
  SortAsc = 'pcac-icon pcac-icon-sort-asc',
  SortDesc = 'pcac-icon pcac-icon-sort-desc'
}
