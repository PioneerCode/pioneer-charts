import { Component, signal } from '@angular/core';
import { version } from '../../../../../pioneer-charts/package.json';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout-footer',
  imports: [
    RouterLink,
    MatDividerModule
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class LayoutFooter {
  // Read straight from the library's package.json so it can't drift from the published version
  // (the hand-maintained literal this replaced had already fallen a release behind).
  version = signal<string>(version);
}
