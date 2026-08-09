import { Component, input } from '@angular/core';

@Component({
  selector: 'app-layout-page-docs-content',
  imports: [],
  templateUrl: './content.html',
  styleUrl: './content.scss'
})
export class LayoutPageDocsContent {
  pageTitle = input.required<string>()
}
