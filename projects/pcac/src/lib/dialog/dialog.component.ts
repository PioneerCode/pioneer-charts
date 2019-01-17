import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'pcac-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class PcacDialogComponent  {
  @Input() width = '50%';
  @Output() closed: EventEmitter<undefined> = new EventEmitter();
  @Output() opened: EventEmitter<undefined> = new EventEmitter();

  public show = false;

  close(): void {
    this.show = false;
    this.closed.emit();
  }

  open(): void {
    this.show = true;
    this.opened.emit();
  }
}
