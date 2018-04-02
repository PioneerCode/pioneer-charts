import { Component, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PcService } from '../../../services/pc.service';

export interface IJumpNav {
  key: string;
  value: string;
  jump: IJumpNav[];
}

@Component({
  selector: 'pc-doc-layout',
  templateUrl: './doc.component.html',
  styleUrls: ['./doc.component.scss']
})
export class DocLayoutComponent {
  @Input() jumpNav: IJumpNav[];
  currentRoute: string[];
  constructor(
    private route: Router,
    public pcService: PcService
  ) {
    this.route.events.subscribe((res) => {
      this.currentRoute = [this.route.url];
    });
  }

  onJumpClick(fragment: string): void {
    document.querySelector('#' + fragment).scrollIntoView();
  }
}
