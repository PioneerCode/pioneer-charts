import { Component, Input } from '@angular/core';
import { PcService } from '../../services/pc.service';
import { ActivatedRoute, Router } from '@angular/router';

export interface IJumpNav {
  key: string;
  value: string;
  jump: IJumpNav[];
}

@Component({
  selector: 'pc-doc-layout',
  templateUrl: './doc-layout.component.html',
  styleUrls: ['./doc-layout.component.scss']
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
