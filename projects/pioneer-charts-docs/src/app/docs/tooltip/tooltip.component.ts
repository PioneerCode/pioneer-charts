import { Component, inject, signal } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import {
  PcacBarVerticalChartComponent,
  PcacData,
  PcacLineChart,
  PcacPieChartComponent,
  PcacTooltipDirective,
} from '@pioneer-code/pioneer-charts';

import { AppService } from '../../app.service';
import { LayoutCode } from '../../layout/code/code';
import { LayoutPageDocs } from '../../layout/page-docs/page-docs';
import { LayoutResourceState } from '../../layout/resource-state/resource-state';
import { IJumpNav } from '../../layout/page-docs/jump-nav/jump-nav';

@Component({
  selector: 'pc-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrl: './tooltip.component.scss',
  imports: [
    DecimalPipe,
    PercentPipe,
    LayoutCode,
    LayoutPageDocs,
    LayoutResourceState,
    MatCardModule,
    PcacBarVerticalChartComponent,
    PcacLineChart,
    PcacPieChartComponent,
    PcacTooltipDirective,
  ]
})
export class TooltipComponent {
  readonly service = inject(AppService);

  /**
   * The hovered datum's share of everything alongside it - its group's, series' or (for the pie,
   * where there is no parent) the whole chart's total. Exists to show what `parent` is for: a
   * template gets the hovered point's siblings, not just the point.
   */
  protected share(point: PcacData, siblings: PcacData[] | undefined): number {
    const total = (siblings ?? []).reduce((sum, d) => sum + Number(d.value ?? 0), 0);
    return total ? Number(point.value ?? 0) / total : 0;
  }

  jumpNav = signal<IJumpNav[]>([
    {
      key: 'Custom Tooltip',
      value: 'custom-tooltip',
    },
    {
      key: 'Try It',
      value: 'try-it',
    },
    {
      key: 'Markup',
      value: 'markup',
    },
    {
      key: 'Template Context',
      value: 'context',
    },
    {
      key: 'Styling',
      value: 'styling',
    },
    {
      key: 'Notes',
      value: 'notes',
    }
  ]);

  markupCode = `<!-- Project an <ng-template pcacTooltip> into any chart. -->
<pcac-bar-vertical-chart [config]="config">
  <ng-template pcacTooltip let-point let-group="parent" let-threshold="isThreshold">
    <div class="my-tooltip">
      <strong>{{ group?.key }}</strong>
      <span>{{ point.key }}: {{ point.value | number }}</span>
      @if (threshold) {
        <em>threshold</em>
      }
    </div>
  </ng-template>
</pcac-bar-vertical-chart>`;

  importCode = `import { PcacBarVerticalChartComponent, PcacTooltipDirective } from '@pioneer-code/pioneer-charts';

@Component({
  imports: [PcacBarVerticalChartComponent, PcacTooltipDirective],
  // ...
})`;

  contextCode = `interface PcacTooltipContext {
  // The hovered datum: a bar, a line/area/plot point, a pie slice, or a threshold.
  $implicit: PcacData;

  // What it sits inside: the group a bar belongs to, the series a point belongs to, or for a
  // threshold the data group it's drawn against. null when there is no enclosing level
  // (pie slices, a chart-wide threshold).
  parent: PcacData | null;

  // True when a bar chart threshold marker is hovered rather than a data point.
  isThreshold: boolean;
}`;

  styleCode = `/* The template owns the whole box; give it whatever look you want. */
.my-tooltip {
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  white-space: nowrap;
}`;
}
