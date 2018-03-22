import { Component } from '@angular/core';
import { PcacService } from '../../services/pc.service';

@Component({
  selector: 'pc-chart-nav',
  templateUrl: './chart-nav.component.html',
  styleUrls: ['./chart-nav.component.scss']
})
export class ChartNavComponent {
  constructor(public pcacService: PcacService) { }
}
