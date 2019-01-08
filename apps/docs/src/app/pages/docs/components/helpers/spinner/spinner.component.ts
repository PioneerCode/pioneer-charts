import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'pc-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {
  public importCode = `import { PcacSpinnerModule } from '@pioneer-code/pioneer-charts';`;
  public markupCode = `<pcac-spinner [showSpinner]="false" [showOverlay]="false"></pcac-spinner>`;
  constructor() { }

  ngOnInit() {
  }

}
