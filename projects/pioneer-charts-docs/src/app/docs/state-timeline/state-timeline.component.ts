import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PcacData, PcacStateTimeline, PcacTooltipDirective } from '@pioneer-code/pioneer-charts';

import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';
import { ChartCard } from '../../layout/chart-card/chart-card';
import { ChartContract } from '../../layout/chart-contract/chart-contract';
import { LayoutBaseConfig } from '../../layout/base-config/base-config.component';
import { statusHistory, strip, totals } from './state-timeline-demo';

@Component({
  selector: 'pc-state-timeline',
  templateUrl: './state-timeline.component.html',
  styleUrl: './state-timeline.component.scss',
  imports: [
    ChartCard,
    ChartContract,
    LayoutBaseConfig,
    LayoutCode,
    LayoutPageDocs,
    PcacStateTimeline,
    PcacTooltipDirective,
    RouterLink,
  ]
})
export class StateTimelineComponent {
  jumpNav = signal<IJumpNav[]>([
    { key: 'State Timeline', value: 'state-timeline' },
    { key: 'Status History', value: 'status-history' },
    { key: 'The Data', value: 'the-data' },
    { key: 'One Row, Its Own Tooltip', value: 'one-row' },
    { key: 'Long Windows', value: 'long-windows' },
    { key: 'Colors', value: 'colors' },
    { key: 'Markup', value: 'markup' },
    { key: 'API', value: 'api' },
    { key: 'Events', value: 'events' },
  ]);

  protected readonly history = { ...statusHistory(), ariaLabel: 'Four services over the last 30 days' };
  protected readonly strip = { ...strip(), ariaLabel: 'The API over the last 30 days' };
  protected readonly stripTotals = totals(this.strip);
  protected readonly longStrip = { ...strip(90), ariaLabel: 'The API over the last 90 days' };

  /** The one-row example's tooltip: each state it was in, in hours. */
  protected hours(period: PcacData): string {
    const of = (key: string) => Number(period.data.find((s) => s.key === key)?.value ?? 0);
    const unknown = Number(period.value) - period.data.reduce((sum, s) => sum + Number(s.value), 0);
    const parts = [
      of('error') && `${of('error')}h in Error`,
      of('warning') && `${of('warning')}h in Warning`,
      unknown && `${unknown}h unknown`,
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : 'OK all day';
  }

  configCode = `import { PcacStateTimelineConfig } from '@pioneer-code/pioneer-charts';

const config: PcacStateTimelineConfig = {
  ...new PcacStateTimelineConfig(),
  height: 112,
  // Least severe first: each day shows the worst it was in
  states: [
    { key: 'ok', label: 'OK' },
    { key: 'warning', label: 'Warning' },
    { key: 'error', label: 'Error' },
  ],
  data: [
    {
      key: 'API', value: null, hide: false,
      data: [
        // A day: 24 hours long, 21 of them OK and 3 in Error
        {
          key: 'Fri, Oct 30', value: 24, hide: false,
          data: [
            { key: 'ok', value: 21, hide: false, data: [] },
            { key: 'error', value: 3, hide: false, data: [] },
          ],
        },
        // ...a period for each day, oldest first
      ],
    },
    // ...a row for each thing watched
  ],
};`;

  dataCode = `// 24 hours, of which 15 known: 12 OK, 3 in Error.
// Drawn red (its worst), 3/15 of what's known in Error, striped for the 9 unknown hours.
{
  key: 'Thu, Nov 12', value: 24, hide: false,
  data: [
    { key: 'ok', value: 12, hide: false, data: [] },
    { key: 'error', value: 3, hide: false, data: [] },
  ],
}`;

  stripCode = `<pcac-state-timeline [config]="config">
  <ng-template pcacTooltip let-day>
    <b>{{ day.key }}</b><br />{{ hours(day) }}
  </ng-template>
</pcac-state-timeline>
<p>Last 30 days: {{ errors }} with errors, {{ warnings }} with warnings</p>

// The config: one row, no label, 14px tall
{ ...new PcacStateTimelineConfig(), height: 14, rowLabels: false, states, data: [row] }`;

  colorsCode = `/* Your own stylesheet: any ancestor of the charts */
.status-panel {
  --pcac-state-timeline-ok-color: #98c9b2;
  --pcac-state-timeline-warning-color: #d97706;
  --pcac-state-timeline-error-color: #bb2d3b;
  --pcac-state-timeline-unknown-color: #e9ecef;
  /* What a state's color is mixed into for its depth: the page's background */
  --pcac-state-timeline-background-color: #fff;
  --pcac-state-timeline-row-label-color: #495057;
}`;

  markupCode = `<pcac-state-timeline [config]="config" (periodClicked)="onClicked($event)" />`;
  importCode = `import { PcacStateTimeline, PcacStateTimelineConfig, PcacStateTimelineState } from '@pioneer-code/pioneer-charts';`;
}
