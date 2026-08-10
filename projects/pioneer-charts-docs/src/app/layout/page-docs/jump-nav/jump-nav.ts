import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface IJumpNav {
  key: string;
  value: string;
}

@Component({
  selector: 'app-layout-jump-nav',
  imports: [
    RouterLink
  ],
  templateUrl: './jump-nav.html',
  styleUrl: './jump-nav.scss'
})
export class LayoutJumpNav {
  readonly jumpNav = input<IJumpNav[]>([]);

  // Emits the target section id rather than scrolling anything itself -
  // LayoutPageDocsContent owns the actual scrolling element (see its
  // scrollToSection()) and is the only one that should touch its scroll
  // position; page-docs.html wires this straight to that method.
  readonly jump = output<string>();

  // `routerLink`/`fragment` on the anchor stay in place alongside this so the
  // URL hash still updates (shareable link, back/forward through jumps);
  // preventDefault() here only stops the router from re-navigating on top of
  // the scroll `jump` triggers.
  onJump(event: Event, id: string) {
    event.preventDefault();
    this.jump.emit(id);
  }
}
