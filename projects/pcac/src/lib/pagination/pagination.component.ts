import { Component, Input, EventEmitter, Output } from '@angular/core';
import { IPcacPaginationConfig, PcacPaginationPageSizeEnum } from './pagination.model';

@Component({
  selector: 'pcac-pagination',
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  @Input() config = {
    currentPageIndex: 1,
    countPerPage: PcacPaginationPageSizeEnum.Ten,
    totalItemsInCollection: 10,
    show: false,
    isCompactView: false
  } as IPcacPaginationConfig;

  @Output() perPageChanged = new EventEmitter<number>();
  @Output() startClicked = new EventEmitter<number>();
  @Output() leftClicked = new EventEmitter<number>();
  @Output() rightClicked = new EventEmitter<number>();
  @Output() endClicked = new EventEmitter<number>();

  get leftIsActive(): boolean {
    return this.config.currentPageIndex !== 1;
  }

  get rightIsActive(): boolean {
    return this.config.currentPageIndex !== Math.ceil(this.config.totalItemsInCollection / this.config.countPerPage);
  }

  get currentRangeText(): string {
    let text = `${this.getStartingRangeText()}-${this.getEndingRangeText()}`;
    if (!this.config.isCompactView) {
      text = text + ` of ${this.config.totalItemsInCollection}`;
    }
    return text;
  }

  onPerPageChanged(count: string): void {
    this.config.countPerPage = parseInt(count, 10);
    this.perPageChanged.emit(this.config.countPerPage);
  }

  onStartClicked(): void {
    if (this.leftIsActive) {
      this.config.currentPageIndex = 1;
      this.startClicked.emit(1);
    }
  }

  onLeftClicked(): void {
    if (this.leftIsActive) {
      this.config.currentPageIndex = this.config.currentPageIndex - 1;
      this.leftClicked.emit(this.config.currentPageIndex);
    }
  }

  onRightClicked(): void {
    if (this.rightIsActive) {
      this.config.currentPageIndex = this.config.currentPageIndex + 1;
      this.rightClicked.emit(this.config.currentPageIndex);
    }
  }

  onEndClicked(): void {
    if (this.rightIsActive) {
      this.config.currentPageIndex = Math.ceil(this.config.totalItemsInCollection / this.config.countPerPage);
      this.endClicked.emit(this.config.currentPageIndex);
    }
  }

  private getStartingRangeText(): number {
    return this.config.countPerPage * (this.config.currentPageIndex - 1) + 1;
  }

  private getEndingRangeText(): number {
    const totalPossiblePage = Math.ceil(this.config.totalItemsInCollection / this.config.countPerPage);

    if (totalPossiblePage === 1) {
      return this.config.totalItemsInCollection;
    }

    if (totalPossiblePage === this.config.currentPageIndex) {
      const total = this.config.countPerPage * (this.config.currentPageIndex - 1);
      const modulus = this.config.totalItemsInCollection % total;
      return total + modulus;
    }

    return this.config.countPerPage * this.config.currentPageIndex;
  }
}
