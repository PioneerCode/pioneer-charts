import { Component } from '@angular/core';
import { IPcacData } from '@pioneer-code/pioneer-charts';
import { PcService } from '../services/pc.service';

@Component({
  selector: 'pc-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent {
  constructor(public pcService: PcService) { }

  onClicked(data: IPcacData) {
    alert(`Key: ${data.key} - Value: ${data.value}`);
  }
}
