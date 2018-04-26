import { Injectable } from '@angular/core';
import { PcacTableSortIconsEnum } from './table.model';
import { IPcacData } from '../core/chart.model';

/**
 * ASC/DESC data sorting
 * 3 sort states - UN-SORTED, ASC, and DESC for icons only
  *  each array of data also has a kpi type so we can sort various ways
 */
export interface ITableSortService {
  sort(data: IPcacData[], columnIndex: number, direction: PcacTableSortIconsEnum): void;
}

@Injectable()
export class TableSortService implements ITableSortService {

  sort(data: IPcacData[], columnIndex: number, direction: PcacTableSortIconsEnum): void {
    if (!data) { return; }
    // this.clearStateExceptCurrent(data, columnIndex);
    this.sortData(data, columnIndex, direction);
    // this.setNewIcon(data, columnIndex, direction);
  }

  private sortData(data: IPcacData[], columnIndex: number, direction: PcacTableSortIconsEnum): void {
    data.sort((a, b) => {
      const comparison = (direction === PcacTableSortIconsEnum.SortAsc)
        ? -this.orderByComparer(a.data[columnIndex].value, b.data[columnIndex].value)
        : this.orderByComparer(a.data[columnIndex].value, b.data[columnIndex].value);

      if (comparison !== 0) {
        return comparison;
      }

      // equal each other
      return 0;
    });
  }

  private orderByComparer(a: any, b: any): number {
    if (a === null || typeof a === 'undefined') { a = 0; }
    if (b === null || typeof b === 'undefined') { b = 0; }

    if ((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))) {
      // is not a number so lowercase the string to properly compare
      if (a.toLowerCase() < b.toLowerCase()) { return -1; }
      if (a.toLowerCase() > b.toLowerCase()) { return 1; }
    } else {
      // parse strings as numbers to compare properly
      if (parseFloat(a) < parseFloat(b)) { return -1; }
      if (parseFloat(a) > parseFloat(b)) { return 1; }
    }

    // equal each other
    return 0;
  }

  // private clearStateExceptCurrent(data: IPcacData[], columnIndex: number): void {
  //   for (let i = 0; i < data.headers.length; i++) {
  //     if (i !== columnIndex) {
  //       data.headers[i].iconName = PcacTableSortIconsEnum.Sort;
  //     }
  //   }
  // }

  // private setNewIcon(data: IPcacData[], columnIndex: number, direction: PcacTableSortIconsEnum): void {
  //   data.headers[columnIndex].iconName = direction === PcacTableSortIconsEnum.SortAsc
  //     ? PcacTableSortIconsEnum.SortAsc
  //     : PcacTableSortIconsEnum.SortDesc;
  // }
}
