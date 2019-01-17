import { Component, ViewChild } from '@angular/core';
import { PcService } from '../../services/pc.service';
import { IPcacPaginationConfig, PcacPaginationPageSizeEnum } from 'projects/pcac/src/lib/pagination/pagination.model';
import { PcacDialogComponent } from 'projects/pcac/src/lib/dialog';
import { IPcacData } from 'projects/pcac/src/lib/core/public_api';

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
    countPerPage: PcacPaginationPageSizeEnum.OneHundred,
    totalItemsInCollection: 13,
    show: true
  } as IPcacPaginationConfig;

  openDialog(): void {
    this.dialog.open();
  }

  onClosed(): void {
    alert('onClosed');
  }

  onOpened(): void {
    alert('onOpened');
  }

  onEditClicked(row: IPcacData): void {
    alert('edit');
  }

  onDeleteClicked(row: IPcacData): void {
    alert('delete');
  }

  onPerPageChanged(perPage: number): void {
    alert(perPage);
  }

  onStartClicked(selectedPage: number): void {
    alert('Start Clicked: ' + selectedPage);
  }

  onLeftClicked(selectedPage: number): void {
    alert('Left Clicked: ' + selectedPage);
  }

  onRightClicked(selectedPage: number): void {
    alert('Right Clicked: ' + selectedPage);
  }

  onEndClicked(selectedPage: number): void {
    alert('End Clicked: ' + selectedPage);
  }
}
