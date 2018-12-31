import { Component, ViewChild, } from '@angular/core';

import { PcService } from '../../../../../services/pc.service';
import { PcacDialogComponent } from '@pioneer-code/pioneer-charts';
import { JumpNavLevel, IJumpNav } from 'apps/docs/src/app/components/jump-nav/jump-nav.component';

@Component({
  selector: 'pc-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent {
  public markupCode = `<pcac-dialog>Hello!</pcac-dialog>`;
  public callCode = `@ViewChild(PcacDialogComponent) dialog: PcacDialogComponent;

openDialog(): void {
  this.dialog.open();
}`;
  public jumpNav = [
    {
      key: 'Dialog',
      value: 'dialog',
      level: JumpNavLevel.h1
    },
    {
      key: 'Markup',
      value: 'markup',
      level: JumpNavLevel.h2
    }
  ] as IJumpNav[];

  @ViewChild(PcacDialogComponent) dialog: PcacDialogComponent;

  constructor(public pcService: PcService) { }

  openDialog(): void {
    this.dialog.open();
  }
}
