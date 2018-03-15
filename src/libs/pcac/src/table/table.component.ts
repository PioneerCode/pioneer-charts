import { Component, OnInit, Input } from '@angular/core';
import { ITableConfig } from './table.model';

@Component({
  selector: 'pcac-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  @Input() config: ITableConfig;

  constructor() { }

  ngOnInit() {
  }
}
