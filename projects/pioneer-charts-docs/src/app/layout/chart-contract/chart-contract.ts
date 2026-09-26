import {
  Component, Directive, ElementRef, ViewContainerRef, afterNextRender, inject, input, signal,
} from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

/** The charts the directive sits on - and the legend, which is only given a button of its own alone. */
const CHARTS =
  'pcac-bar-vertical-chart, pcac-bar-horizontal-chart, pcac-line-chart, pcac-area-chart, pcac-plot-chart, ' +
  'pcac-pie-chart, pcac-donut-chart';

/** Each element the directive sits on, and the config class its contract is an instance of. */
const CONFIG_CLASSES: Record<string, string> = {
  'pcac-bar-vertical-chart': 'PcacBarVerticalChartConfig',
  'pcac-bar-horizontal-chart': 'PcacBarHorizontalChartConfig',
  'pcac-line-chart': 'PcacLineChartConfig',
  'pcac-area-chart': 'PcacAreaChartConfig',
  'pcac-plot-chart': 'PcacPlotChartConfig',
  'pcac-pie-chart': 'PcacPieChartConfig',
  'pcac-donut-chart': 'PcacDonutChartConfig',
  'pcac-legend': 'PcacLegendConfig',
};

interface ContractData {
  configClass: string;
  config: unknown;
}

/** The dialog: a chart's config, as JSON, with a button to copy it. */
@Component({
  selector: 'app-chart-contract-dialog',
  imports: [MatButton, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle],
  template: `
    <h2 mat-dialog-title>Contract</h2>
    <mat-dialog-content>
      <p class="pc-contract-intro">The <code>{{ data.configClass }}</code> this example is drawn from, exactly as it's
        bound to <code>[config]</code>.</p>
      <pre class="pc-contract-json">{{ json }}</pre>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="button" (click)="copy()">{{ copied() ? 'Copied' : 'Copy' }}</button>
      <button matButton="filled" type="button" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: `
    .pc-contract-intro { margin: 0 0 0.75rem; }
    .pc-contract-json {
      margin: 0;
      padding: 1rem;
      overflow: auto;
      font-size: 14px;
      color: rgb(214, 51, 132);
      background: var(--mat-sys-surface-container-low, #f7f7f7);
      border-radius: 8px;
    }
  `,
})
export class ChartContractDialog {
  readonly data = inject<ContractData>(MAT_DIALOG_DATA);
  readonly json = JSON.stringify(this.data.config, null, 2);
  readonly copied = signal(false);
  private readonly clipboard = inject(Clipboard);

  copy(): void {
    this.copied.set(this.clipboard.copy(this.json));
  }
}

/** The `{ }` button in a chart card's top-right corner, opening its contract (see ChartContract). */
@Component({
  selector: 'app-chart-contract-button',
  imports: [MatIcon, MatIconButton, MatTooltip],
  host: { class: 'pc-contract-button' },
  template: `
    <button matIconButton type="button" matTooltip="Show contract" aria-label="Show this chart's contract"
      (click)="open()">
      <mat-icon>data_object</mat-icon>
    </button>
  `,
  styles: `
    :host {
      position: absolute;
      top: 4px;
      right: 4px;
      z-index: 1;
    }
  `,
})
export class ChartContractButton {
  readonly source = input.required<ChartContract>();
  private readonly dialog = inject(MatDialog);

  open(): void {
    this.dialog.open<ChartContractDialog, ContractData>(ChartContractDialog, {
      data: { configClass: this.source().configClass, config: this.source().config() },
      width: '720px',
      maxWidth: 'calc(100vw - 32px)',
    });
  }
}

/**
 * Puts a "show contract" button on the card around a chart (or legend): it opens a dialog with the
 * chart's config as JSON.
 *
 * Sits on the chart element itself and declares a `config` input of its own, so Angular binds it
 * whatever the chart's `[config]` is bound to - the dialog shows exactly what the chart is drawn
 * from, read when it's opened, with nothing in the template to keep in step.
 *
 * The button is added after the first render, in the browser only: it's no use before the app has
 * started, and a pre-rendered page's HTML then matches what hydration expects. It goes into the
 * nearest `mat-card`, whose top-right corner it's placed in. A legend in the same card as a chart
 * doesn't get one: the corner holds one button, and the chart's contract is the one it's for.
 */
@Directive({
  // Spelled out rather than built from CHARTS: a selector has to be a literal for the compiler.
  selector:
    'pcac-bar-vertical-chart, pcac-bar-horizontal-chart, pcac-line-chart, pcac-area-chart, pcac-plot-chart, ' +
    'pcac-pie-chart, pcac-donut-chart, pcac-legend',
})
export class ChartContract {
  readonly config = input<unknown>();
  readonly configClass: string;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const container = inject(ViewContainerRef);
    this.configClass = CONFIG_CLASSES[host.tagName.toLowerCase()] ?? 'config';

    afterNextRender(() => {
      const card = host.closest('mat-card');
      if (!card || (!host.matches(CHARTS) && card.querySelector(CHARTS))) {
        return;
      }
      const button = container.createComponent(ChartContractButton);
      button.setInput('source', this);
      card.appendChild(button.location.nativeElement);
    });
  }
}
