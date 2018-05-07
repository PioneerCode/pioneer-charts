import { Component } from '@angular/core';
import { PcService } from '../../services/pc.service';

@Component({
  selector: 'pc-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent {
  constructor(public pcService: PcService) { }
}
