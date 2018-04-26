import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  AfterViewInit,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
  QueryList,
  ViewChildren
} from '@angular/core';
import { IPcacTableConfig, IPcacTableHeader, PcacTableSortIconsEnum } from './table.model';
import { IPcacData } from 'dist/bundles/@pioneer-code/pioneer-charts/core';
import { TableSortService } from './table-sort.service';

@Component({
  selector: 'pcac-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  providers: [
    TableSortService
  ]
})
export class PcacTableComponent implements OnChanges, AfterViewInit {
  @Input() config = { height: 240 } as IPcacTableConfig;
  @ViewChild('tableBody') tableBody: ElementRef;
  @ViewChild('tableFooter') tableFooter: ElementRef;
  @ViewChildren('rows') rows: QueryList<any>;

  columnWidths = [] as number[];
  rowHeight: number;
  footerHeight: number;
  headers = [] as IPcacTableHeader[];
  rowData = [] as IPcacData[];

  constructor(
    private sortService: TableSortService,
    private changeDetector: ChangeDetectorRef
  ) {
  }


  ngAfterViewInit() {
    // @ngFor rows finished
    this.rows.changes.subscribe(t => {
      this.calculateColumnWidths();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.config) {
      this.config.height = this.config.height + 36;
      this.calculateColumnWidths();
      this.setHeaders();
      this.setRows();
    }
  }

  sortTable(columnIndex: number) {
    const direction = this.headers[columnIndex].icon === PcacTableSortIconsEnum.SortAsc ?
      PcacTableSortIconsEnum.SortDesc :
      PcacTableSortIconsEnum.SortAsc;
    this.clearStateExceptCurrent(columnIndex);
    this.sortService.sort(this.rowData, columnIndex, direction);
    this.setNewIcon(columnIndex, direction);
  }

  private clearStateExceptCurrent(columnIndex: number): void {
    for (let i = 0; i < this.headers.length; i++) {
      if (i !== columnIndex) {
        this.headers[i].icon = PcacTableSortIconsEnum.Sort;
      }
    }
  }

  private setNewIcon(columnIndex: number, direction: PcacTableSortIconsEnum): void {
    this.headers[columnIndex].icon = direction === PcacTableSortIconsEnum.SortAsc
      ? PcacTableSortIconsEnum.SortAsc
      : PcacTableSortIconsEnum.SortDesc;
  }

  private setHeaders(): void {
    for (let i = 0; i < this.config.data[0].data.length; i++) {
      this.headers.push({
        key: this.config.data[0].data[i].key,
        value: this.config.data[0].data[i].value,
        icon: PcacTableSortIconsEnum.Sort
      } as IPcacTableHeader);
    }
  }

  private setRows(): void {
    this.rowData = JSON.parse(JSON.stringify(this.config.data)).slice(1);
  }

  private calculateColumnWidths(): void {
    // const el = this.tableBody.nativeElement;
    if (this.tableBody.nativeElement.rows[0]) {
      const cells = this.tableBody.nativeElement.rows[0].cells;
      this.columnWidths = [] as number[];
      for (let i = 0; i < cells.length; i++) {
        this.columnWidths.push(cells[i].clientWidth);
      }
      // https://stackoverflow.com/questions/44922384/angular4-change-detection-expressionchangedafterithasbeencheckederror
      // this.footerHeight = this.tableFooter.nativeElement.clientHeight;
      this.changeDetector.detectChanges();
    }
  }
}
