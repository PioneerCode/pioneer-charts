import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface IJumpNav {
  key: string;
  value: string;
}

/**
 * "On this page": a link per section. Each is a plain `routerLink` with a `fragment`, so the URL
 * takes the section's #hash (shareable, back/forward) and the router scrolls to it
 * (`anchorScrolling` in app.config.ts).
 */
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
}
