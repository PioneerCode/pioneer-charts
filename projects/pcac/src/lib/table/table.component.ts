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
import { TableSortService } from './table-sort.service';
import { IPcacData } from '../core/chart.model';

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
  adjustedHeight = 200;

  constructor(
    private sortService: TableSortService,
    private changeDetector: ChangeDetectorRef
  ) {
  }

  ngAfterViewInit() {
    this.initTableUi();
    // @ngFor rows finished
    this.rows.changes.subscribe(t => {
      if (this.config.enableSticky) {
        this.calculateColumnWidths();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.initTableUi();
  }

  private initTableUi() {
    if (this.config && this.config.data && this.config.data.length > 0) {
      this.adjustedHeight = this.config.height + 36;
      if (this.config.enableSticky) {
        this.calculateColumnWidths();
      }
      this.setHeaders();
      this.setRows();
    }
  }

  /**
   * When dealing with sticky header/footer, we need to calc widths of absolute positioned
   * table columns.
   */
  private calculateColumnWidths(): void {
    if (this.tableBody.nativeElement.rows[0]) {
      const cells = this.tableBody.nativeElement.rows[0].cells;
      this.columnWidths = [] as number[];
      for (let i = 0; i < cells.length; i++) {
        this.columnWidths.push(cells[i].clientWidth);
      }
      // https://stackoverflow.com/questions/44922384/angular4-change-detection-expressionchangedafterithasbeencheckederror
      this.changeDetector.detectChanges();
    }
  }

  /**
   * Set internal cache of headers to ease template manipulation and apply icon
   */
  private setHeaders(): void {
    this.headers = [] as IPcacTableHeader[];
    for (let i = 0; i < this.config.data[0].data.length; i++) {
      this.headers.push({
        key: this.config.data[0].data[i].key,
        value: this.config.data[0].data[i].value,
        icon: PcacTableSortIconsEnum.Sort
      } as IPcacTableHeader);
    }
  }

  /**
   * Deep copy of rows to ease template manipulation and sorting
   */
  private setRows(): void {
    this.rowData = JSON.parse(JSON.stringify(this.config.data)).slice(1);
  }

  /**
   * On header click, sort column.
   */
  sortTable(columnIndex: number) {
    const direction = this.headers[columnIndex].icon === PcacTableSortIconsEnum.SortAsc ?
      PcacTableSortIconsEnum.SortDesc :
      PcacTableSortIconsEnum.SortAsc;
    this.clearStateExceptCurrent(columnIndex);
    this.sortService.sort(this.rowData, columnIndex, direction);
    this.headers[columnIndex].icon = direction;
  }

  private clearStateExceptCurrent(columnIndex: number): void {
    for (let i = 0; i < this.headers.length; i++) {
      if (i !== columnIndex) {
        this.headers[i].icon = PcacTableSortIconsEnum.Sort;
      }
    }
  }
}
