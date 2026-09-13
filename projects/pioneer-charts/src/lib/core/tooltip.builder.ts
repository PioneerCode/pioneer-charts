import { ApplicationRef, EmbeddedViewRef, Injectable, TemplateRef, inject } from '@angular/core';
import { PcacData, PcacFormatEnum } from './chart.model';
import { PcacTooltipContext } from './tooltip.directive';
import { select } from 'd3';

@Injectable({
  providedIn: 'root',
})
export class PcacTooltipBuilder {
  private appRef = inject(ApplicationRef);

  /**
   * One tooltip element shared by every chart on the page, appended to `<body>` so it can float
   * over anything. It's only ever a positioning shell: the default look (`.pcac-d3-tooltip-default`)
   * is toggled on when the library renders its own key/value content and off when a consumer's
   * `<ng-template pcacTooltip>` is rendered into it instead, so a custom template owns the whole box.
   */
  public tooltip = select('body')
    .append('div')
    .attr('class', 'pcac-d3-tooltip');

  /**
   * The consumer template currently rendered into the shell, if any. Created on the first show
   * of a hover and torn down in `hideTooltip()` - not kept around between hovers - so a view is
   * never left holding onto a declaring component that has since been destroyed (e.g. after a
   * route change). While it lives, repeated `mousemove`s just update its context in place.
   */
  private view: EmbeddedViewRef<PcacTooltipContext> | null = null;
  private viewTemplate: TemplateRef<PcacTooltipContext> | null = null;

  /**
   * Shows the tooltip for a hovered datum at the event's position. Renders `template` when the
   * chart has one projected; otherwise falls back to the default key/value content, formatted per
   * `valueFormat`/`keyFormat`.
   */
  showTooltip(
    event: MouseEvent,
    template: TemplateRef<PcacTooltipContext> | undefined,
    context: PcacTooltipContext,
    valueFormat?: PcacFormatEnum,
    keyFormat?: PcacFormatEnum
  ): void {
    if (template) {
      this.renderTemplate(template, context);
    } else {
      this.renderDefault(context.$implicit, valueFormat, keyFormat);
    }
    this.position(event);
  }

  /**
   * @deprecated Builders should call `PcacChart.showTooltip()`, which routes through a chart's
   * projected `pcacTooltip` template. This only ever renders the default content.
   */
  showBarTooltip(event: MouseEvent, data: PcacData, valueFormat?: PcacFormatEnum, keyFormat?: PcacFormatEnum): void {
    this.showTooltip(event, undefined, { $implicit: data, parent: null, isThreshold: false, index: 0, parentIndex: null }, valueFormat, keyFormat);
  }

  hideTooltip(): void {
    this.tooltip.style('display', 'none');
    this.destroyView();
  }

  private renderDefault(data: PcacData, valueFormat?: PcacFormatEnum, keyFormat?: PcacFormatEnum): void {
    this.destroyView();
    this.tooltip
      .classed('pcac-d3-tooltip-default', true)
      .html(this.getBarTipData(data, valueFormat, keyFormat));
  }

  private renderTemplate(template: TemplateRef<PcacTooltipContext>, context: PcacTooltipContext): void {
    if (this.view && this.viewTemplate === template) {
      // Same hover, new mouse position/datum: keep the view and just refresh what it's bound to.
      Object.assign(this.view.context, context);
    } else {
      this.destroyView();
      this.tooltip.classed('pcac-d3-tooltip-default', false).html(null);

      // Same technique as the CDK's DomPortalOutlet: create the view off-tree, attach it to the
      // app so it takes part in change detection (a template reading a signal keeps updating
      // while shown), then physically move its nodes into the shell. The view's own injector is
      // the declaring component's, so pipes/DI in the template resolve as they would in place.
      this.view = template.createEmbeddedView(context);
      this.viewTemplate = template;
      this.appRef.attachView(this.view);
      const shell = this.tooltip.node() as HTMLDivElement;
      for (const node of this.view.rootNodes) {
        shell.appendChild(node);
      }
    }
    // The trigger is a D3-native mouse listener, which nothing in Angular observes under zoneless
    // change detection, so the view has to be checked explicitly for the new context to render
    // before it's measured for positioning.
    this.view.detectChanges();
  }

  private destroyView(): void {
    if (!this.view) {
      return;
    }
    // `destroy()` also detaches the view from the ApplicationRef it was attached to, but it
    // doesn't pull the nodes we moved into the shell back out of the DOM - that's what a
    // ViewContainerRef would normally do on removal - so the shell is emptied here explicitly.
    this.view.destroy();
    this.view = null;
    this.viewTemplate = null;
    this.tooltip.html(null);
  }

  /**
   * Centers the (already rendered) tooltip horizontally on the cursor and sits it just above.
   * Measured from the real box rather than fixed offsets so it works for content of any size.
   */
  private position(event: MouseEvent): void {
    const shell = this.tooltip.style('display', 'inline-block').node() as HTMLDivElement;
    this.tooltip
      .style('left', event.pageX - shell.offsetWidth / 2 + 'px')
      .style('top', event.pageY - shell.offsetHeight - 8 + 'px');
  }

  private getBarTipData(data: PcacData, valueFormat?: PcacFormatEnum, keyFormat?: PcacFormatEnum): string | null {
    let value = data.value;
    let key = data.key

    if (valueFormat) {
      switch (valueFormat) {
        case PcacFormatEnum.Percentage:
          value = value as number * 100 + '%';
          break;
        case PcacFormatEnum.Fahrenheit:
          value = `${value} F`;
          break;
      }
    }

    if (key && keyFormat) {
      switch (keyFormat) {
        case PcacFormatEnum.DateTime:
          key = new Date(key).toLocaleDateString('en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
          break;
      }
    }

    const finalValue = value ? value.toString() : value;

    return key ? key + '<br>' + finalValue : `${finalValue}`;
  }
}
