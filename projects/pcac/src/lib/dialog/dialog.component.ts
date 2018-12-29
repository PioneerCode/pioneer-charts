import { Component, Input } from '@angular/core';

@Component({
  selector: 'pcac-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class PcacDialogComponent  {
  @Input() width = '50%';

  public show = false;

  close(): void {
    this.show = false;
  }

  open(): void {
    this.show = true;
  }
}
