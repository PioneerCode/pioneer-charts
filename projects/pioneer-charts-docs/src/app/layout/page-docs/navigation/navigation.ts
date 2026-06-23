import { Component, ChangeDetectionStrategy } from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./navigation.scss']
})
export class LayoutPageDocsNavigation {

}
