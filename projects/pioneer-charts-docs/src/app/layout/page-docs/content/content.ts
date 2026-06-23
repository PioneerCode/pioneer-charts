import { Component, input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-layout-page-docs-content',
  imports: [],
  templateUrl: './content.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./content.scss']
})
export class LayoutPageDocsContent {
  pageTitle = input.required<string>()
}
