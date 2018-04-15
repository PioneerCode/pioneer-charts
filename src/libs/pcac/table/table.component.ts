import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { IPcacTableConfig } from './table.model';

@Component({
  selector: 'pcac-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class PcacTableComponent implements OnChanges {
  @Input() config = { height: 240 } as IPcacTableConfig;

  ngOnChanges(changes: SimpleChanges) {
    if (this.config) {
      this.config.height = this.config.height + 40;
    }
  }
}
