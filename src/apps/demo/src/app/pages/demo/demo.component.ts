import { Component } from '@angular/core';
import { PcService } from '../../services/pc.service';

@Component({
  selector: 'pc-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent {
  constructor(public pcacService: PcService) { }
}
