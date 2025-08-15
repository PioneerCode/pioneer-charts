import { Component } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-layout-page-docs-navigation',
  imports: [
    RouterLink,
    MatListModule
  ],
  templateUrl: './navigation.html',
  styleUrls: ['./navigation.scss']
})
export class LayoutPageDocsNavigation {

}
