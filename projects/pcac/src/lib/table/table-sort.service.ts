import { Injectable } from '@angular/core';
import { PcacTableSortIconsEnum } from './table.model';
import { IPcacData } from '../core/chart.model';

export interface ITableSortService {
  sort(data: IPcacData[], columnIndex: number, direction: PcacTableSortIconsEnum): void;
}

@Injectable()
export class TableSortService implements ITableSortService {

  sort(data: IPcacData[], columnIndex: number, direction: PcacTableSortIconsEnum): void {
    if (data) {
      this.sortData(data, columnIndex, direction);
    }
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
}
