import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';

export interface IPager {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  startPage: number;
  endPage: number;
  startIndex: number;
  endIndex: number;
  pages: number[];
}

@Component({
  selector: 'pcac-pagination',
  templateUrl: './pagination.component.html'
})
export class PaginationComponent implements OnInit {
  /**
   * What page are we currently on?
   * Index is 0 based
   */
  @Input() currentPageIndex = 1;

  /**
   * How many records do we who per page
   */
  @Input() countPerPage = 10;

  /**
   * How many items are in the entire collection
   */
  @Input() totalItemsInCollection = 100;

  /**
   * Hide or show
   */
  @Input() show = false;

  @Output() startClicked = new EventEmitter<void>();
  @Output() leftClicked = new EventEmitter<number>();
  @Output() rightClicked = new EventEmitter<number>();
  @Output() endClicked = new EventEmitter<void>();

  pager = {} as IPager;
  constructor() { }

  ngOnInit() {
    this.setPager(this.currentPageIndex, this.totalItemsInCollection);
  }

  private onStartClicked(): void {
    this.startClicked.emit();
  }

  private onLeftClicked(selectedPage: number): void {
    this.leftClicked.emit(selectedPage);
  }

  private onRightClicked(selectedPage: number): void {
    this.rightClicked.emit(selectedPage);
  }

  private onEndClicked(): void {
    this.endClicked.emit();
  }

  getPager() {
    return this.pager;
  }

  setPager(page: number, totalItems: number) {
    if (page < 1 || page > this.pager.totalPages) {
      return;
    }

    this.pager = this.buildPagerObject(totalItems, page);
  }

  private buildPagerObject(totalItems: number, currentPage: number) {
    // default to first page
    currentPage = currentPage || 1;

    // calculate total pages
    const totalPages = Math.ceil(totalItems / this.countPerPage);

    let startPage: number;
    let endPage: number;

    if (totalPages <= 4) {
      // less than 4 total pages so show all
      startPage = 1;
      endPage = totalPages;
    } else {
      // more than 4 total pages so calculate start and end pages
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 4;
      } else if (currentPage + 1 >= totalPages) {
        startPage = totalPages - 3;
        endPage = totalPages;
      } else {
        startPage = currentPage - 2;
        endPage = currentPage + 1;
      }
    }

    // calculate start and end item indexes
    const startIndex = (currentPage - 1) * this.countPerPage;
    const endIndex = Math.min(startIndex + this.countPerPage - 1, totalItems - 1);

    // create an array of pages *ngFor
    const pages = this.range(startPage, endPage + 1);

    return {
      totalItems: totalItems,
      currentPage: currentPage,
      pageSize: this.countPerPage,
      totalPages: totalPages,
      startPage: startPage,
      endPage: endPage,
      startIndex: startIndex,
      endIndex: endIndex,
      pages: pages
    } as IPager;
  }

  /**
   * Generate an integer Array containing an arithmetic progression.
   * Inspired by _.range()
   */
  private range(start: number, stop: number, step?: number) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    const length = Math.max(Math.ceil((stop - start) / step), 0);
    const range = Array(length);

    for (let i = 0; i < length; i++ , start += step) {
      range[i] = start;
    }

    return range;
  }
}
