import { Component } from '@angular/core';

import { PcService } from '../../../../../services/pc.service';
import { IPcacPaginationConfig, PcacPaginationPageSizeEnum } from 'projects/pcac/src/lib/pagination/public_api';

@Component({
  selector: 'pc-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent  {
  public config = {
    currentPageIndex: 1,
    countPerPage: PcacPaginationPageSizeEnum.Ten,
    totalItemsInCollection: 100,
    show: true
  } as IPcacPaginationConfig;

  public markupCode = `<pcac-pagination (perPageChanged)="onPerPageChanged($event)"
  (startClicked)="onStartClicked($event)"
  (leftClicked)="onLeftClicked($event)"
  (rightClicked)="onRightClicked($event)"
  (endClicked)="onEndClicked($event)"
  [(config)]="config">
</pcac-pagination>`;

  constructor(public pcService: PcService) { }

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
