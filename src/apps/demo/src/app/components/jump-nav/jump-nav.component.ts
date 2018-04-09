import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

export interface IJumpNav {
  key: string;
  value: string;
  jump: IJumpNav[];
}

@Component({
  selector: 'pc-jump-nav',
  templateUrl: './jump-nav.component.html',
  styleUrls: ['./jump-nav.component.scss']
})
export class JumpNavComponent {
  @Input() jumpNav: IJumpNav[];
  currentRoute: string[];

  constructor(
    private route: Router
  ) {
    this.route.events.subscribe((res) => {
      this.currentRoute = [this.route.url];
    });
  }

  onJumpClick(fragment: string): void {
    document.querySelector('#' + fragment).scrollIntoView();
  }
}
