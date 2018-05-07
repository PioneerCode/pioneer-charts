import { Component, OnInit, Input } from '@angular/core';
import { IHeaderConfig } from './header.model';

@Component({
  selector: 'pcac-header',
  templateUrl: './header.component.html'
})
export class PcacHeaderComponent {
  @Input() config: IHeaderConfig;
}
