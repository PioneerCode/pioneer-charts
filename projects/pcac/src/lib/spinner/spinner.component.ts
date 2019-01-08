import { Component, Input } from '@angular/core';

@Component({
  selector: 'pcac-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class PcacSpinnerComponent {
  @Input()
  showSpinner = true;

  @Input()
  showOverlay = true;
}
