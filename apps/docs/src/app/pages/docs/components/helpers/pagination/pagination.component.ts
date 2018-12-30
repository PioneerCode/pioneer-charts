import { Component } from '@angular/core';

import { PcService } from '../../../../../services/pc.service';
import { IPcacPaginationConfig } from 'projects/pcac/src/lib/pagination/public_api';

@Component({
  selector: 'pc-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent  {
  public config = {
    currentPageIndex: 1,
    countPerPage: 10,
    totalItemsInCollection: 100,
    show: true
  } as IPcacPaginationConfig;

  public markupCode = `<pcac-pagination (startClicked)="onStartClicked()"
  (leftClicked)="onLeftClicked(event)"
  (rightClicked)="onRightClicked(event)"
  (endClicked)="onEndClicked()"
  [(config)]="config">
</pcac-pagination>`;

  constructor(public pcService: PcService) { }

  onStartClicked(): void {
    alert('Start Clicked')
  }

  onLeftClicked(selectedPage: number): void {
    alert('Left Clicked: ' + selectedPage);
  }

  onRightClicked(selectedPage: number): void {
    alert('Right Clicked: ' + selectedPage);
  }

  onEndClicked(): void {
    alert('End Clicked');
  }
}
