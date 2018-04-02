import { Component, Input } from '@angular/core';
import { PcService } from '../../services/pc.service';

export interface IJumpNav {
  key: string;
  value: string;
  jump: IJumpNav[];
}

@Component({
  selector: 'pc-doc-nav',
  templateUrl: './doc-nav.component.html',
  styleUrls: ['./doc-nav.component.scss']
})
export class DocNavComponent {
  @Input() jumpNav: IJumpNav[];
  constructor(public pcService: PcService) { }
}
