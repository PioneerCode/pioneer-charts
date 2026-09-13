import { Directive, TemplateRef, inject } from '@angular/core';
import { PcacData } from './chart.model';

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
 * the declaring component), so anything a normal template can do works here too.
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
