import { Component } from '@angular/core';
import { JumpNavLevel, IJumpNav } from 'projects/pioneer-charts-web/src/app/layouts/jump-nav/jump-nav.component';

@Component({
  selector: 'pc-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent {
  public importCode = `import { PcacSpinnerModule } from '@pioneer-code/pioneer-charts';`;
  public markupCode = `<pcac-spinner [showSpinner]="false" [showOverlay]="false"></pcac-spinner>`;
  public jumpNav = [
    {
      key: 'Spinner',
      value: 'spinner',
      level: JumpNavLevel.h1
    }
  ] as IJumpNav[];
}
