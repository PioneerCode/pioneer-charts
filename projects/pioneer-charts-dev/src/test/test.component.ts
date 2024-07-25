import { Component, ViewChild } from '@angular/core';

@Component({
  selector: 'pc-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  public showModal = true;

  // @ViewChild(PcacDialogComponent, { static: true }) dialog: PcacDialogComponent;

  // constructor(public pcService: PcService) { }

  // public config = {
  //   currentPageIndex: 1,
  //   countPerPage: PcacPaginationPageSizeEnum.OneHundred,
  //   totalItemsInCollection: 13,
  //   show: true,
  //   isCompactView: true
  // } as IPcacPaginationConfig;

  // openDialog(): void {
  //   this.dialog.open();
  // }

  // onClosed(): void {
  //   alert('onClosed');
  // }

  // onOpened(): void {
  //   alert('onOpened');
  // }

  // onEditClicked(row: IPcacData): void {
  //   alert('edit');
  // }

  // onDeleteClicked(row: IPcacData): void {
  //   alert('delete');
  // }

  // onPerPageChanged(perPage: number): void {
  //   alert(perPage);
  // }

  // onStartClicked(selectedPage: number): void {
  //   alert('Start Clicked: ' + selectedPage);
  // }

  // onLeftClicked(selectedPage: number): void {
  //   alert('Left Clicked: ' + selectedPage);
  // }

  // onRightClicked(selectedPage: number): void {
  //   alert('Right Clicked: ' + selectedPage);
  // }

  // onEndClicked(selectedPage: number): void {
  //   alert('End Clicked: ' + selectedPage);
  // }
}
