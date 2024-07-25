import { Component } from '@angular/core';
import { IPcacData } from '@pioneer-code/pioneer-charts';

import { AppService } from '../../app.service';

@Component({
  selector: 'pc-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent {
  constructor(public pcService: AppService) { }

  onEditClicked(row: IPcacData): void {
    alert("Edit Row");
  }

  onDeleteClicked(row: IPcacData): void {
    alert("Delete Row");
  }

  onHistoryClicked(row: IPcacData): void {
    alert("Show History");
  }
}
