import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IJumpNav } from '../../../layout/page-docs/jump-nav/jump-nav';
import { LayoutBaseConfig } from '../../../layout/base-config/base-config.component';
import { LayoutCode } from '../../../layout/code/code';
import { LayoutPageDocs } from '../../../layout/page-docs/page-docs';

@Component({
  selector: 'app-plot-line-area-base',
  imports: [
    LayoutCode,
    LayoutBaseConfig,
    LayoutPageDocs,
    RouterLink,
  ],
  templateUrl: './base.component.html',
})
export class PlotLineAreaBaseComponent {
  readonly title = input.required<string>();
  readonly lead = input.required<string>();
  readonly markup = input.required<string>();
  readonly importCode = input.required<string>();

  /** The page's own sections, between the chart and Markup, for its jump nav. */
  readonly sections = input<IJumpNav[]>([]);

  readonly jumpNav = computed<IJumpNav[]>(() => [
    { key: 'Chart', value: 'chart' },
    ...this.sections(),
    { key: 'Markup', value: 'markup' },
    { key: 'API', value: 'api' },
    { key: 'Configuration', value: 'configuration' },
    { key: 'Events', value: 'events' },
  ]);
}
