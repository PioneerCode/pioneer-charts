import { ApplicationRef, DOCUMENT, EmbeddedViewRef, Injectable, OnDestroy, TemplateRef, inject } from '@angular/core';
import { PcacData, PcacFormatEnum } from './chart.model';
import { PcacTooltipContext } from './tooltip.directive';
import { Selection, select } from 'd3-selection';

@Injectable({
  providedIn: 'root',
})
export class PcacTooltipBuilder implements OnDestroy {
  private appRef = inject(ApplicationRef);
  private document = inject(DOCUMENT);

  private shell: Selection<HTMLDivElement, unknown, null, undefined> | null = null;

  /**
   * One tooltip element shared by every chart on the page, appended to `<body>` so it can float
   * over anything. It's only ever a positioning shell: the default look (`.pcac-d3-tooltip-default`)
   * is toggled on when the library renders its own key/value content and off when a consumer's
   * `<ng-template pcacTooltip>` is rendered into it instead, so a custom template owns the whole box.
   *
   * Created on first use rather than with the service, which every chart builder injects: that
   * way nothing touches the DOM until a chart actually shows a tooltip, so building a chart
   * where there's no browser `document` (server-side rendering) doesn't throw. Removed again in
   * `ngOnDestroy()`, when the app that owns this root service is destroyed.
   */
  get tooltip(): Selection<HTMLDivElement, unknown, null, undefined> {
    this.shell ??= select(this.document.body)
      .append('div')
      .attr('class', 'pcac-d3-tooltip');
    return this.shell;
  }

  /**
   * The consumer template currently rendered into the shell, if any. Created on the first show
   * of a hover and torn down in `hideTooltip()` - not kept around between hovers - so a view is
   * never left holding onto a declaring component that has since been destroyed (e.g. after a
   * route change). While it lives, repeated `mousemove`s just update its context in place.
   */
  private view: EmbeddedViewRef<PcacTooltipContext> | null = null;
  private viewTemplate: TemplateRef<PcacTooltipContext> | null = null;

  /** Space left between the tooltip and whatever it's placed next to (the cursor or an anchor). */
  static readonly GAP = 8;

  /**
   * Shows the tooltip for a hovered datum. Renders `template` when the chart has one projected;
   * otherwise falls back to the default key/value content, formatted per `valueFormat`/`keyFormat`.
   * Placed beside `anchor` when one is given (see `positionBeside`), else above the event's position.
   */
  showTooltip(
    event: MouseEvent,
    template: TemplateRef<PcacTooltipContext> | undefined,
    context: PcacTooltipContext,
    valueFormat?: PcacFormatEnum,
    keyFormat?: PcacFormatEnum,
    anchor?: Element | null
  ): void {
    if (template) {
      this.renderTemplate(template, context);
    } else {
      this.renderDefault(context.$implicit, valueFormat, keyFormat);
    }
    const shell = this.measurable();
    if (anchor) {
      this.positionBeside(shell, anchor);
    } else {
      this.positionAbove(shell, event);
    }
  }

  /**
   * @deprecated Builders should call `PcacChart.showTooltip()`, which routes through a chart's
   * projected `pcacTooltip` template. This only ever renders the default content.
   */
  showBarTooltip(event: MouseEvent, data: PcacData, valueFormat?: PcacFormatEnum, keyFormat?: PcacFormatEnum): void {
    this.showTooltip(event, undefined, { $implicit: data, parent: null, isThreshold: false, index: 0, parentIndex: null, coincident: [] }, valueFormat, keyFormat);
  }

  hideTooltip(): void {
    if (!this.shell) {
      // Never shown, so there's nothing to hide - and no reason to create the element just to.
      return;
    }
    this.shell.style('display', 'none');
    this.destroyView();
  }

  ngOnDestroy(): void {
    this.destroyView();
    this.shell?.remove();
    this.shell = null;
  }

  /**
   * The library's own key/value content. Built from text nodes, never parsed as HTML: `key` and
   * `value` are consumer data, and markup in them must show as text rather than run.
   */
  private renderDefault(data: PcacData, valueFormat?: PcacFormatEnum, keyFormat?: PcacFormatEnum): void {
    this.destroyView();
    const { key, value } = this.getBarTipData(data, valueFormat, keyFormat);
    const shell = this.tooltip
      .classed('pcac-d3-tooltip-default', true)
      .html(null)
      .node() as HTMLDivElement;
    if (key !== null) {
      shell.append(key, this.document.createElement('br'));
    }
    shell.append(value);
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
    this.shell?.html(null);
  }

  /**
   * Shows the (already rendered) shell at the page's top-left so it can be measured. Left where the
   * last hover put it, a shell near the right edge would be squeezed by its containing block and
   * measure narrower (wrapped) than the content really is once it's moved somewhere with room.
   */
  private measurable(): HTMLDivElement {
    return this.tooltip
      .style('left', '0px')
      .style('top', '0px')
      .style('display', 'inline-block')
      .node() as HTMLDivElement;
  }

  /**
   * Centers the tooltip horizontally on the cursor and sits it just above. Measured from the real
   * box rather than fixed offsets so it works for content of any size.
   */
  private positionAbove(shell: HTMLDivElement, event: MouseEvent): void {
    this.tooltip
      .style('left', event.pageX - shell.offsetWidth / 2 + 'px')
      .style('top', event.pageY - shell.offsetHeight - PcacTooltipBuilder.GAP + 'px');
  }

  /**
   * Places the tooltip diagonally off one corner of `anchor`'s rendered box, so it never covers
   * the anchor itself (e.g. a point's image). Prefers above-right - the tooltip's bottom-left
   * corner at the anchor's top-right - and flips each axis independently when the tooltip wouldn't
   * fit in the viewport that way: to the left when there's no room on the right, below when there's
   * no room above. When neither side of an axis fits, it takes whichever side has more room.
   */
  private positionBeside(shell: HTMLDivElement, anchor: Element): void {
    const gap = PcacTooltipBuilder.GAP;
    const box = anchor.getBoundingClientRect();
    const width = shell.offsetWidth;
    const height = shell.offsetHeight;
    // `clientWidth`/`clientHeight` of the root, unlike `innerWidth`/`innerHeight`, exclude scrollbars.
    const viewport = this.document.documentElement;
    const view = this.document.defaultView;

    const right = viewport.clientWidth - box.right - gap;
    const left = box.left - gap;
    const above = box.top - gap;
    const below = viewport.clientHeight - box.bottom - gap;

    const toRight = width <= right || (width > left && right >= left);
    const toTop = height <= above || (height > below && above >= below);

    const x = toRight ? box.right + gap : box.left - gap - width;
    const y = toTop ? box.top - gap - height : box.bottom + gap;

    // The rect is in viewport coordinates; the shell is absolutely positioned against the page.
    this.tooltip
      .style('left', x + (view?.scrollX ?? 0) + 'px')
      .style('top', y + (view?.scrollY ?? 0) + 'px');
  }

  /** The default tooltip's two lines as plain text; `key` is null when the datum has none. */
  private getBarTipData(
    data: PcacData,
    valueFormat?: PcacFormatEnum,
    keyFormat?: PcacFormatEnum,
  ): { key: string | null; value: string } {
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

    // A key of 0 (e.g. hour 0) is a real key; only a missing or empty one leaves the line out.
    return {
      key: key === null || key === undefined || key === '' ? null : String(key),
      value: value === null || value === undefined ? '' : String(value),
    };
  }
}
