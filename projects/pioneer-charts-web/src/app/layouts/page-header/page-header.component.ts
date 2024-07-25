import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  standalone: true
})
export class PageHeaderComponent {
  @Input() title!: string;
  @Input() anchor = '';
}
