import { Component } from '@angular/core';
import { PcacService } from '../../services/pc.service';

@Component({
  selector: 'pc-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent {
  constructor(public pcacService: PcacService) { }
}
