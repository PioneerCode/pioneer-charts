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

@Component({
  selector: 'pcac-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
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

  constructor(private changeDetector: ChangeDetectorRef) {

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
      this.setHeaderIcons();
      this.calculateColumnWidths();
    }
  }

  private setHeaderIcons(): void {
    for (let i = 0; i < this.config.data[0].data.length; i++) {
      this.headers.push({
        key: this.config.data[0].data[i].key,
        value: this.config.data[0].data[i].value,
        icon: PcacTableSortIconsEnum.Sort
      } as IPcacTableHeader);
    }
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
