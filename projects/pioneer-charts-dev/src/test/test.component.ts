import { Component, inject } from '@angular/core';
import { PcService } from '../app/services/pc.service';

@Component({
  selector: 'pc-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  standalone: true
})
export class TestComponent {
  public showModal = true;

  readonly service = inject(PcService)
}
