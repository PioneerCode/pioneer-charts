import { Component, Input } from '@angular/core';
import { IPcacTableConfig } from './table.model';

@Component({
  selector: 'pcac-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class PcacTableComponent {
  @Input() config: IPcacTableConfig;
}
