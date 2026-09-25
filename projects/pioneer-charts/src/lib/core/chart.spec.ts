import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PcacChart } from './chart';
import { PcacTooltipBuilder } from './tooltip.builder';
import { PcacAxisChartConfig, PcacChartConfig, PcacFormatEnum } from './chart.model';

/**
 * Builds an `ElementRef` around a real (jsdom) `<svg>` whose parent's `clientWidth`/`clientHeight`
 * report `width`/`height`. Needs to be a real node, not a bare stub object: `initializeChartState`
 * runs it through `d3.select(...).select('g').remove()` before ever measuring anything. jsdom
 * doesn't do layout, so the metrics are stubbed directly rather than produced by real box metrics.
 */
function chartElm(width: number, height = 0): ElementRef {
  const parent = document.createElement('div');
  Object.defineProperty(parent, 'clientWidth', { value: width, configurable: true });
  Object.defineProperty(parent, 'clientHeight', { value: height, configurable: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  parent.appendChild(svg);
  return { nativeElement: svg } as ElementRef;
}

function config(height = 200): PcacChartConfig {
  return { height, data: [{ key: 'a', value: 1, hide: false, data: [] }] };
}

function heightFullConfig(height = 200): PcacChartConfig {
  return { ...config(height), heightFull: true };
}

describe('PcacChart', () => {
  let chart: PcacChart;

  beforeEach(() => {
    // PcacChart's fields are `inject()`ed at field-initializer time, so it needs an active
    // injection context - same requirement its real subclasses (BarVerticalChartBuilder, etc.)
    // get for free from being constructed via Angular's `providers: [...]`.
    chart = TestBed.runInInjectionContext(() => new PcacChart());
  });

  describe('initializeChartState', () => {
    it('returns false and leaves state untouched when the container has not been laid out yet (clientWidth 0)', () => {
      const widthBefore = chart.width;
      const result = chart.initializeChartState(chartElm(0), config());

      expect(result).toBe(false);
      expect(chart.width).toBe(widthBefore);
    });

    it('returns false when clientWidth is smaller than the margins alone', () => {
      // margin.left(40) + margin.right(16) = 56; a 40px container computes a negative width.
      const result = chart.initializeChartState(chartElm(40), config());
      expect(result).toBe(false);
    });

    it('returns true and sets width/height/colors when the container has a real size', () => {
      const result = chart.initializeChartState(chartElm(800), config(321));

      expect(result).toBe(true);
      expect(chart.width).toBe(800 - chart.margin.left - chart.margin.right);
      expect(chart.height).toBe(321);
      expect(chart.colors.length).toBeGreaterThan(0);
    });
  });

  describe('containerSizeChanged', () => {
    it('returns true before any successful build has happened', () => {
      expect(chart.containerSizeChanged(chartElm(800))).toBe(true);
    });

    it('returns false once the container is measured again at the same width', () => {
      chart.initializeChartState(chartElm(800), config());
      expect(chart.containerSizeChanged(chartElm(800))).toBe(false);
    });

    it('returns true when the container has genuinely resized', () => {
      chart.initializeChartState(chartElm(800), config());
      expect(chart.containerSizeChanged(chartElm(600))).toBe(true);
    });

    it('returns true if the container measures 0 again (still not laid out / hidden)', () => {
      // Only relevant pre-first-build, but guard the degenerate case regardless: a still-0
      // measurement should never read as "unchanged, skip".
      expect(chart.containerSizeChanged(chartElm(0))).toBe(true);
    });

    // Regression test: a build that fails for lack of width (the chart's tab hidden with
    // `display: none`) has already removed the previous drawing. If the container then comes back
    // at the width it was last drawn at, that must still read as changed, or nothing redraws it.
    it('returns true when a container returns to its last width after a failed build', () => {
      chart.initializeChartState(chartElm(800), config());
      chart.initializeChartState(chartElm(0), config());
      expect(chart.containerSizeChanged(chartElm(800))).toBe(true);
    });

    // Regression test: bar-horizontal-chart's setHorizontalMarginsBasedOnContent() recomputes
    // `width` and overwrites `margin.left` *after* initializeChartState(), based on measured
    // axis-label widths. containerSizeChanged() must keep comparing against the container's raw
    // measured width, not `width`/`margin` - otherwise it permanently reads "changed" for any
    // chart whose builder adjusts margins mid-build, causing an extra rebuild on every load
    // (see PcacChartResizeService's first, guaranteed ResizeObserver callback).
    it('is unaffected by a builder mutating width/margin.left after a successful build', () => {
      chart.initializeChartState(chartElm(800), config());
      const widthAfterInit = chart.width;

      // Simulate bar-horizontal-chart's mid-build margin recalculation.
      chart.margin.left = 90;
      chart.width = chart.width - 90;

      expect(chart.width).not.toBe(widthAfterInit);
      expect(chart.containerSizeChanged(chartElm(800))).toBe(false);
    });

    it('ignores a container height change when the chart is not heightFull', () => {
      // Without heightFull the container's height is driven by the <svg> the chart just drew, so
      // reacting to it would mean rebuilding every time the chart's own height changed.
      chart.initializeChartState(chartElm(800, 400), config());
      expect(chart.containerSizeChanged(chartElm(800, 900))).toBe(false);
    });

    it('returns true when a heightFull chart\'s container has grown taller', () => {
      chart.initializeChartState(chartElm(800, 400), heightFullConfig());
      expect(chart.containerSizeChanged(chartElm(800, 900))).toBe(true);
    });

    it('returns false when a heightFull chart\'s container is unchanged in both dimensions', () => {
      chart.initializeChartState(chartElm(800, 400), heightFullConfig());
      expect(chart.containerSizeChanged(chartElm(800, 400))).toBe(false);
    });
  });

  describe('initializeChartState with heightFull', () => {
    it('fills the container, leaving room for the vertical margins', () => {
      // buildContainer() adds margin.top/bottom back on top of `height` when sizing the <svg>, so
      // the *total* SVG - not the drawing area - is what should match the container.
      chart.initializeChartState(chartElm(800, 500), heightFullConfig(200));

      expect(chart.height).toBe(500 - chart.margin.top - chart.margin.bottom);
      expect(chart.height + chart.margin.top + chart.margin.bottom).toBe(500);
    });

    it('treats height as a minimum when the container is shorter than it', () => {
      chart.initializeChartState(chartElm(800, 100), heightFullConfig(200));
      expect(chart.height).toBe(200);
    });

    it('falls back to height when the container has no definite height to fill', () => {
      // An auto-height wrapper leaves nothing for the host's `height: 100%` to resolve against,
      // so the container measures 0 here.
      chart.initializeChartState(chartElm(800, 0), heightFullConfig(200));
      expect(chart.height).toBe(200);
    });

    it('still uses height verbatim when heightFull is off, however tall the container is', () => {
      chart.initializeChartState(chartElm(800, 900), config(200));
      expect(chart.height).toBe(200);
    });
  });

  describe('reserveTickSizeMargins', () => {
    it('leaves the default margins alone when no tick size is given', () => {
      chart.resetMargin();
      chart.reserveTickSizeMargins(undefined, undefined);
      expect(chart.margin).toEqual({ top: 8, right: 16, bottom: 20, left: 40 });
    });

    it('is a no-op at D3\'s own default tick size', () => {
      chart.resetMargin();
      chart.reserveTickSizeMargins(PcacChart.DEFAULT_TICK_SIZE, PcacChart.DEFAULT_TICK_SIZE);
      expect(chart.margin).toEqual({ top: 8, right: 16, bottom: 20, left: 40 });
    });

    it('grows bottom for a longer x tick and left for a longer y tick, by the delta from the default', () => {
      chart.resetMargin();
      chart.reserveTickSizeMargins(16, 26);
      expect(chart.margin).toEqual({ top: 8, right: 16, bottom: 30, left: 60 });
    });

    it('hands the difference back to the plot area for a shorter tick', () => {
      chart.resetMargin();
      chart.reserveTickSizeMargins(0, 0);
      expect(chart.margin).toEqual({ top: 8, right: 16, bottom: 14, left: 34 });
    });

    it('only touches the axis a size was given for', () => {
      chart.resetMargin();
      chart.reserveTickSizeMargins(undefined, 20);
      expect(chart.margin).toEqual({ top: 8, right: 16, bottom: 20, left: 54 });
    });

    it('shrinks the measured plot area, so the labels stay inside the SVG', () => {
      chart.resetMargin();
      chart.initializeChartState(chartElm(800), config(200));
      const defaultWidth = chart.width;

      chart.resetMargin();
      chart.reserveTickSizeMargins(undefined, 26);
      chart.initializeChartState(chartElm(800), config(200));

      expect(chart.width).toBe(defaultWidth - 20);
    });

    it('takes a taller bottom margin out of the plot height, so the SVG does not grow', () => {
      chart.resetMargin();
      chart.reserveTickSizeMargins(16, undefined);
      chart.initializeChartState(chartElm(800), config(200));

      expect(chart.margin.bottom).toBe(30);
      expect(chart.height).toBe(190);
      expect(chart.height + chart.margin.top + chart.margin.bottom).toBe(200 + 8 + 20);
    });

    it('gives a shorter x tick\'s room back to the plot height', () => {
      chart.resetMargin();
      chart.reserveTickSizeMargins(0, undefined);
      chart.initializeChartState(chartElm(800), config(200));

      expect(chart.margin.bottom).toBe(14);
      expect(chart.height).toBe(206);
    });

    it('applies the same reduction to the heightFull floor', () => {
      chart.resetMargin();
      chart.reserveTickSizeMargins(16, undefined);
      // auto-height container: nothing to fill, so the floor is what comes back
      chart.initializeChartState(chartElm(800, 0), heightFullConfig(200));

      expect(chart.height).toBe(190);
    });

    it('forgets the reserved height on resetMargin', () => {
      chart.resetMargin();
      chart.reserveTickSizeMargins(16, undefined);
      chart.resetMargin();
      chart.initializeChartState(chartElm(800), config(200));

      expect(chart.height).toBe(200);
    });
  });

  describe('reserveEdgeSpace', () => {
    it('raises a margin that is too small to the given size', () => {
      chart.resetMargin();
      chart.reserveEdgeSpace({ top: 20, right: 30 });

      expect(chart.margin.top).toBe(20);
      expect(chart.margin.right).toBe(30);
    });

    it('leaves a margin alone that already covers it - "at least", not "add"', () => {
      chart.resetMargin();
      chart.reserveEdgeSpace({ left: 20, bottom: 20 });

      expect(chart.margin.left).toBe(40);
      expect(chart.margin.bottom).toBe(20);
    });

    it('only touches the sides it is given', () => {
      chart.resetMargin();
      chart.reserveEdgeSpace({ top: 20 });

      expect(chart.margin).toEqual({ top: 20, right: 16, bottom: 20, left: 40 });
    });

    it('takes vertical growth out of the plot height, so the SVG does not grow', () => {
      chart.resetMargin();
      chart.reserveEdgeSpace({ top: 20, bottom: 30 });
      chart.initializeChartState(chartElm(800), config(200));

      expect(chart.height).toBe(200 - 12 - 10);
      expect(chart.height + chart.margin.top + chart.margin.bottom).toBe(200 + 8 + 20);
    });

    it('shrinks the measured plot width for horizontal growth', () => {
      chart.resetMargin();
      chart.reserveEdgeSpace({ left: 50, right: 50 });
      chart.initializeChartState(chartElm(800), config(200));

      expect(chart.width).toBe(800 - 100);
    });

    it('stacks on top of room already reserved for ticks and labels, without double-counting', () => {
      chart.resetMargin();
      // bottom: 20 + (16 - 6) = 30, height 190
      chart.reserveTickSizeMargins(16, undefined);
      chart.reserveEdgeSpace({ bottom: 25, top: 20 });
      chart.initializeChartState(chartElm(800), config(200));

      expect(chart.margin.bottom).toBe(30);
      expect(chart.margin.top).toBe(20);
      expect(chart.height).toBe(200 - 10 - 12);
    });

    it('applies the same reduction to the heightFull floor', () => {
      chart.resetMargin();
      chart.reserveEdgeSpace({ top: 20 });
      chart.initializeChartState(chartElm(800, 0), heightFullConfig(200));

      expect(chart.height).toBe(188);
    });

    it('forgets the reserved space on resetMargin', () => {
      chart.resetMargin();
      chart.reserveEdgeSpace({ top: 20, left: 60 });
      chart.resetMargin();
      chart.initializeChartState(chartElm(800), config(200));

      expect(chart.margin.top).toBe(8);
      expect(chart.margin.left).toBe(40);
      expect(chart.height).toBe(200);
    });
  });

  describe('initializeAxisState', () => {
    function axisConfig(overrides: Partial<PcacAxisChartConfig> = {}): PcacAxisChartConfig {
      return { ...config(200), ...overrides };
    }

    it('resolves missing axes to defaults, so an object-literal config needs neither', () => {
      chart.initializeAxisState(axisConfig(), 'y');
      expect(chart.xAxis).toEqual({ hide: false, showGrid: false, ticks: 5, tickSize: undefined, showLine: false, format: PcacFormatEnum.None, domainMin: 0, domainMax: 100 });
      expect(chart.yAxis).toEqual({ hide: false, showGrid: true, ticks: 5, tickSize: undefined, showLine: false, format: PcacFormatEnum.None, domainMin: 0, domainMax: 100 });
      expect(chart.margin).toEqual({ top: 8, right: 16, bottom: 20, left: 40 });
    });

    it('showGrid defaults on for the chart\'s own grid axis and off for the other, unless set', () => {
      chart.initializeAxisState(axisConfig(), 'x');
      expect(chart.xAxis.showGrid).toBe(true);
      expect(chart.yAxis.showGrid).toBe(false);

      chart.initializeAxisState(axisConfig({ xAxis: { showGrid: false }, yAxis: { showGrid: true } }), 'x');
      expect(chart.xAxis.showGrid).toBe(false);
      expect(chart.yAxis.showGrid).toBe(true);
    });

    it('fills in only what an axis leaves out', () => {
      chart.initializeAxisState(axisConfig({ xAxis: { ticks: 3, showLine: true } }), 'y');
      expect(chart.xAxis).toEqual({ hide: false, showGrid: false, ticks: 3, tickSize: undefined, showLine: true, format: PcacFormatEnum.None, domainMin: 0, domainMax: 100 });
    });

    it('keeps a given format and domain, including a 0 and a DateTime string', () => {
      chart.initializeAxisState(axisConfig({
        xAxis: { format: PcacFormatEnum.DateTime, domainMin: '2024-01-01', domainMax: '2024-01-31' },
        yAxis: { format: PcacFormatEnum.Percentage, domainMin: 0, domainMax: 1 },
      }), 'y');
      expect(chart.xAxis).toMatchObject({ format: PcacFormatEnum.DateTime, domainMin: '2024-01-01', domainMax: '2024-01-31' });
      expect(chart.yAxis).toMatchObject({ format: PcacFormatEnum.Percentage, domainMin: 0, domainMax: 1 });
    });

    it('a hidden y axis gives left and top to the plot; a hidden x axis gives bottom and right', () => {
      const cfg = axisConfig({ yAxis: { hide: true } });
      chart.initializeAxisState(cfg, 'y');
      expect(chart.margin).toEqual({ top: 0, right: 16, bottom: 20, left: 0 });
      expect(cfg.height).toBe(208);

      const cfg2 = axisConfig({ xAxis: { hide: true } });
      chart.initializeAxisState(cfg2, 'y');
      expect(chart.margin).toEqual({ top: 8, right: 0, bottom: 0, left: 40 });
      expect(cfg2.height).toBe(220);
    });

    it('keeps hiddenAxisMargin on a hidden axis\'s sides instead of 0', () => {
      const cfg = axisConfig({ xAxis: { hide: true }, yAxis: { hide: true } });
      chart.initializeAxisState(cfg, 'y', 8);
      expect(chart.margin).toEqual({ top: 8, right: 8, bottom: 8, left: 8 });
      // top was already 8, so only bottom's 12 moves into the plot
      expect(cfg.height).toBe(212);
    });

    it('does not reserve tick-size room for an axis that is hidden', () => {
      const cfg = axisConfig({ xAxis: { hide: true, tickSize: 30 }, yAxis: { tickSize: 30 } });
      chart.initializeAxisState(cfg, 'y');
      expect(chart.margin.bottom).toBe(0);
      expect(chart.margin.left).toBe(40 + 24);
      // and no reserved height either: the hidden x axis's bottom margin went wholly to the plot
      expect(cfg.height).toBe(220);
    });

    it('reserves AXIS_LABEL_SPACE for a label, taking the x label\'s share out of the plot height', () => {
      const cfg = axisConfig({ xAxis: { label: 'Day' }, yAxis: { label: 'Revenue' } });
      chart.initializeAxisState(cfg, 'y');
      expect(chart.margin).toEqual({ top: 8, right: 16, bottom: 20 + 18, left: 40 + 18 });
      chart.initializeChartState(chartElm(800), cfg);
      expect(chart.height).toBe(200 - 18);
      expect(chart.height + chart.margin.top + chart.margin.bottom).toBe(228);
    });

    it('reserves AXIS_SUB_LABEL_SPACE for sub labels, on top of a label\'s space', () => {
      chart.initializeAxisState(axisConfig({ xAxis: { subLabels: { min: 'Low' } }, yAxis: { label: 'Y', subLabels: { max: 'High' } } }), 'y');
      expect(chart.margin.bottom).toBe(20 + 16);
      expect(chart.margin.left).toBe(40 + 18 + 16);
    });

    it('reserves nothing for an empty subLabels object', () => {
      chart.initializeAxisState(axisConfig({ xAxis: { subLabels: {} } }), 'y');
      expect(chart.margin.bottom).toBe(20);
    });

    it('reserves nothing for a label on a hidden axis', () => {
      chart.initializeAxisState(axisConfig({ xAxis: { hide: true, label: 'Day' } }), 'y');
      expect(chart.margin.bottom).toBe(0);
    });

    it('starts each build from the default margins', () => {
      chart.initializeAxisState(axisConfig({ xAxis: { hide: true }, yAxis: { hide: true, tickSize: 30 } }), 'y');
      chart.initializeAxisState(axisConfig(), 'y');
      expect(chart.margin).toEqual({ top: 8, right: 16, bottom: 20, left: 40 });
    });
  });

  // A rebuild or destroy removes the hovered element, which gets no mouseout to close the tooltip.
  describe('tooltip release', () => {
    const datum = { key: 'k', value: 1, hide: false, data: [] };
    let tooltip: PcacTooltipBuilder;
    let shell: HTMLDivElement;

    beforeEach(() => {
      tooltip = TestBed.inject(PcacTooltipBuilder);
      shell = tooltip.tooltip.node() as HTMLDivElement;
    });

    afterEach(() => tooltip.hideTooltip());

    it('hides the chart\'s own tooltip when it rebuilds or is destroyed', () => {
      chart.showTooltip(new MouseEvent('mousemove'), datum, { index: 0 });
      chart.initializeChartState(chartElm(800), config());
      expect(shell.style.display).toBe('none');

      chart.showTooltip(new MouseEvent('mousemove'), datum, { index: 0 });
      chart.ngOnDestroy();
      expect(shell.style.display).toBe('none');
    });

    it('leaves another chart\'s tooltip open', () => {
      const other = TestBed.runInInjectionContext(() => new PcacChart());
      other.showTooltip(new MouseEvent('mousemove'), datum, { index: 0 });

      chart.initializeChartState(chartElm(800), config());
      chart.ngOnDestroy();

      expect(shell.style.display).toBe('inline-block');
    });
  });

  describe('accessible name', () => {
    it('announces the chart as one image, named by its config', () => {
      const elm = chartElm(800);
      chart.initializeChartState(elm, { ...config(), ariaLabel: 'Sales by month' });

      expect(elm.nativeElement.getAttribute('role')).toBe('img');
      expect(elm.nativeElement.getAttribute('aria-label')).toBe('Sales by month');
    });

    it('falls back to a generic name without an ariaLabel', () => {
      const elm = chartElm(800);
      chart.initializeChartState(elm, config());

      expect(elm.nativeElement.getAttribute('aria-label')).toBe('Chart');
    });
  });
});
