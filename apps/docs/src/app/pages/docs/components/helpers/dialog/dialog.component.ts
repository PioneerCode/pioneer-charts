import { Component,  } from '@angular/core';

import { PcService } from '../../../../../services/pc.service';

@Component({
  selector: 'pc-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  constructor(public pcService: PcService) { }
}
