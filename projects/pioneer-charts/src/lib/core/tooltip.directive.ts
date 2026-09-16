import { Directive, TemplateRef, inject } from '@angular/core';
import { PcacData } from './chart.model';

/**
 * A datum drawn at the same coordinate as the hovered one (see `PcacTooltipContext.coincident`),
 * located the same way the context locates `$implicit`: `parent` is the series it belongs to,
 * `index` its position in `parent.data`, `parentIndex` the series' position in the chart's `data`.
 */
export interface PcacTooltipCoincident {
  data: PcacData;
  parent: PcacData;
  index: number;
  parentIndex: number;
}

/**
 * Template context handed to a consumer's `<ng-template pcacTooltip>` each time a tooltip is shown.
 */
export interface PcacTooltipContext {
  /**
   * The hovered datum: a bar, a line/area/plot point, a pie slice, or a threshold. Bound with a
   * bare `let-point` (or any name) in the template.
   */
  $implicit: PcacData;

  /**
   * The `PcacData` the hovered datum sits inside - the group a bar belongs to, or the series a
   * point belongs to. For a threshold, the data group it's drawn against (a threshold's own
   * `PcacData` usually carries only a value, so this is where its label lives). `null` when there
   * is no enclosing level (pie slices, a chart-wide threshold).
   */
  parent: PcacData | null;

  /**
   * True when the hovered element is a threshold marker on a bar chart rather than a data point.
   * In that case `$implicit` is the threshold's own `PcacData`.
   */
  isThreshold: boolean;

  /**
   * Position of `$implicit` in the array it was taken from: `parent.data` when there is a parent
   * (a bar within its group, a point within its series), or the chart's top-level `data` when
   * there isn't (a pie slice). For a threshold it's the position in `config.thresholds`, or in
   * `config.thresholds[parentIndex].data` for a per-bar threshold.
   *
   * Together with `parentIndex` this lets a template reach back into whatever collection the
   * `PcacData` was built from, as long as that collection is parallel to `data` (same order, no
   * filtering): `items[parentIndex][index]` for a two-level chart, `items[index]` for a pie.
   * Charts never reorder `data`, so the correspondence is stable across builds and resizes.
   */
  index: number;

  /**
   * Position of `parent` in the chart's top-level `data`; `null` whenever `parent` is.
   */
  parentIndex: number | null;

  /**
   * Every *other* datum drawn at exactly the same coordinate as `$implicit`, in data order, so a
   * template can list who else is at the hovered point. Set by the line, area and plot charts,
   * whether or not the plot chart's `pointFanOut` has spread the points apart (without it, the
   * hovered point is the only one of them visible, which makes this list all the more useful).
   * Empty on the other charts and whenever nothing shares the point.
   */
  coincident: PcacTooltipCoincident[];
}

/**
 * Marks an `<ng-template>` projected into any chart component as that chart's tooltip. When
 * present it replaces the default key/value tooltip *entirely* - the library only positions the
 * rendered template; it applies no background, padding or text styling of its own, so the template
 * owns the whole box.
 *
 * ```html
 * <pcac-bar-vertical-chart [config]="config">
 *   <ng-template pcacTooltip let-point let-group="parent">
 *     <div class="my-tooltip">{{ group?.key }} / {{ point.key }}: {{ point.value | number }}</div>
 *   </ng-template>
 * </pcac-bar-vertical-chart>
 * ```
 *
 * The template is rendered with full Angular semantics (pipes, directives, components, DI from
 * the declaring component), so anything a normal template can do works here too. `index` and
 * `parentIndex` locate the hovered datum within `data`, so a template can pull extra fields from
 * the consumer's own source collection when that collection is parallel to `data`:
 *
 * ```html
 * <ng-template pcacTooltip let-point let-i="index" let-g="parentIndex">
 *   <div class="my-tooltip">{{ orders[g!][i].customer }}: {{ point.value | number }}</div>
 * </ng-template>
 * ```
 *
 * `coincident` lists the other points at the hovered coordinate, each located the same way:
 *
 * ```html
 * <ng-template pcacTooltip let-point let-others="coincident">
 *   <div class="my-tooltip">
 *     {{ point.key }}, {{ point.value }}
 *     @for (other of others; track other.parentIndex) { <div>Also here: {{ other.parent.key }}</div> }
 *   </div>
 * </ng-template>
 * ```
 */
@Directive({
  selector: 'ng-template[pcacTooltip]'
})
export class PcacTooltipDirective {
  readonly templateRef = inject<TemplateRef<PcacTooltipContext>>(TemplateRef);

  /**
   * Lets the template type-checker know the shape of `let-` variables declared on the
   * `<ng-template>`, so `point.value` etc. are checked against `PcacData` under strictTemplates.
   */
  static ngTemplateContextGuard(_dir: PcacTooltipDirective, _ctx: unknown): _ctx is PcacTooltipContext {
    return true;
  }
}
