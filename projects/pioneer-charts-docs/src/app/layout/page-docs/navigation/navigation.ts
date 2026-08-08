import { Component } from '@angular/core';
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
  styleUrls: ['./navigation.scss']
})
export class LayoutPageDocsNavigation {

}
