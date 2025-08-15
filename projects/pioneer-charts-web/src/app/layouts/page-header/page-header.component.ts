import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html'
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly anchor = input('');
}
