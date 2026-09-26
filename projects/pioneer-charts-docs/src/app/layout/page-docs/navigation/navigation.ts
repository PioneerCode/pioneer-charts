import { Component, input } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-layout-page-docs-navigation',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatListModule
  ],
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss'
})
export class LayoutPageDocsNavigation {
  /**
   * The `<nav>`'s id. The page holds two of these below 960px - the drawer's, which the header's
   * Menu button points at (aria-controls), and the hidden desktop sidebar's - so each has its own.
   */
  readonly navId = input('docs-navigation');
}
