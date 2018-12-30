import { Component, ViewChild, } from '@angular/core';

import { PcService } from '../../../../../services/pc.service';
import { PcacDialogComponent } from '@pioneer-code/pioneer-charts';

@Component({
  selector: 'pc-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  public markupCode = `<pcac-dialog>Hello!</pcac-dialog>`;

  @ViewChild(PcacDialogComponent) dialog: PcacDialogComponent;

  constructor(public pcService: PcService) { }

  openDialog(): void {
    this.dialog.open();
  }
}
