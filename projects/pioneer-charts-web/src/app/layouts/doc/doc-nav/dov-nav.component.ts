import { Component, inject } from '@angular/core';
import { AppService } from '../../../app.service';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-doc-nav',
  templateUrl: './doc-nav.component.html',
  styleUrls: ['./doc-nav.component.scss'],
  standalone: true,
  imports: [
    NgClass,
    RouterLink
  ]
})
export class DocNavComponent {
  readonly service = inject(AppService);
}
