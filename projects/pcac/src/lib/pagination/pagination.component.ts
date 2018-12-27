import { Component, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'pcac-pagination',
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  /**
   * What page are we currently on?
   */
  @Input() currentPageIndex = 1;

  /**
   * How many records do we who per page
   */
  @Input() countPerPage = 10;

  /**
   * How many items are in the entire collection
   */
  @Input() totalItemsInCollection = 13;

  /**
   * Hide or show
   */
  @Input() show = false;

  @Output() startClicked = new EventEmitter<void>();
  @Output() leftClicked = new EventEmitter<number>();
  @Output() rightClicked = new EventEmitter<number>();
  @Output() endClicked = new EventEmitter<void>();

  get leftIsActive(): boolean {
    return this.currentPageIndex !== 1;
  }

  get rightIsActive(): boolean {
    return this.currentPageIndex !== Math.ceil(this.totalItemsInCollection / this.countPerPage);
  }

  get currentRangeText(): string {
    return `${this.getStartingRangeText()}-${this.getEndingRangeText()} of ${this.totalItemsInCollection}`;
  }

  private getStartingRangeText(): number {
    return this.countPerPage * (this.currentPageIndex - 1) + 1;
  }

  private getEndingRangeText(): number {
    const totalPossiblePage = Math.ceil(this.totalItemsInCollection / this.countPerPage);

    if (totalPossiblePage === this.currentPageIndex) {
      const total = this.countPerPage * (this.currentPageIndex - 1);
      const modulus = this.totalItemsInCollection % total;
      return total + modulus;
    }

    return this.countPerPage * this.currentPageIndex;
  }

  private onStartClicked(): void {
    if (this.leftIsActive) {
      this.startClicked.emit();
    }
  }

  private onLeftClicked(selectedPage: number): void {
    if (this.leftIsActive) {
      this.leftClicked.emit(selectedPage);
    }
  }

  private onRightClicked(selectedPage: number): void {
    if (this.rightIsActive) {
      this.rightClicked.emit(selectedPage);
    }
  }

  private onEndClicked(): void {
    if (this.rightIsActive) {
      this.endClicked.emit();
    }
  }
}
