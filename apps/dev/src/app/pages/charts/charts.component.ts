import { Component } from '@angular/core';
import { PcService } from '../../services/pc.service';
import { IPcacData } from '../../../../../../projects/pcac/src/lib/core';

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
