import { Component } from '@angular/core';


@Component({
  selector: 'pc-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent  {
//   public config = {
//     currentPageIndex: 1,
//     countPerPage: PcacPaginationPageSizeEnum.Ten,
//     totalItemsInCollection: 100,
//     show: true
//   } as IPcacPaginationConfig;
//   public importCode = `import { PcacPaginationModule } from '@pioneer-code/pioneer-charts';`;
//   public jumpNav = [
//     {
//       key: 'Pagination',
//       value: 'pagination',
//       level: JumpNavLevel.h1
//     },
//     {
//       key: 'Markup',
//       value: 'markup',
//       level: JumpNavLevel.h2
//     },
//     {
//       key: 'API',
//       value: 'api',
//       level: JumpNavLevel.h2
//     },
//     {
//       key: 'Contract',
//       value: 'contract',
//       level: JumpNavLevel.h2
//     }
//   ] as IJumpNav[];

//   public markupCode = `<pcac-pagination (perPageChanged)="onPerPageChanged($event)"
//   (startClicked)="onStartClicked($event)"
//   (leftClicked)="onLeftClicked($event)"
//   (rightClicked)="onRightClicked($event)"
//   (endClicked)="onEndClicked($event)"
//   [(config)]="config">
// </pcac-pagination>`;

//   constructor(public pcService: PcService) { }

//   onPerPageChanged(perPage: number): void {
//     alert(perPage);
//   }

//   onStartClicked(selectedPage: number): void {
//     alert('Start Clicked: ' + selectedPage);
//   }

//   onLeftClicked(selectedPage: number): void {
//     alert('Left Clicked: ' + selectedPage);
//   }

//   onRightClicked(selectedPage: number): void {
//     alert('Right Clicked: ' + selectedPage);
//   }

//   onEndClicked(selectedPage: number): void {
//     alert('End Clicked: ' + selectedPage);
//   }
}
