import { Component, input } from '@angular/core';

/**
 * A docs page's content: its title and whatever the page projects. Scrolling to a section (a link
 * on the page, "On this page", or a URL's #fragment) is the router's (`anchorScrolling` in
 * app.config.ts), which scrolls the page itself.
 */
@Component({
  selector: 'app-layout-page-docs-content',
  imports: [],
  templateUrl: './content.html',
  styleUrl: './content.scss'
})
export class LayoutPageDocsContent {
  pageTitle = input.required<string>()
}
