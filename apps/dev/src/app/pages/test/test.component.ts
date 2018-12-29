import { Component, ViewChild } from '@angular/core';
import { PcService } from '../../services/pc.service';
import { IPcacPaginationConfig } from 'projects/pcac/src/lib/pagination/pagination.model';
import { PcacDialogComponent } from 'projects/pcac/src/lib/dialog';

@Component({
  selector: 'pc-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  public showModal = true;

  @ViewChild(PcacDialogComponent) dialog: PcacDialogComponent;

  constructor(public pcService: PcService) { }

  public config = {
    currentPageIndex: 1,
    countPerPage: 10,
    totalItemsInCollection: 13,
    show: true,
  } as IPcacPaginationConfig;

  openDialog(): void {
    this.dialog.open();
  }

  onStartClicked(): void {
    console.log('start');
  }

  onLeftClicked(selectedPage: number): void {
    console.log('left');
  }

  onRightClicked(selectedPage: number): void {
    console.log('right');
  }

  onEndClicked(): void {
    console.log('end');
  }
}
