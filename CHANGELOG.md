<a name="22.2.20"></a>
# [v22.2.20]

### Added
  - `PcacData.id`: an optional identifier of your own (a record's primary key, say), never drawn,
    carried through to every click output (`dotClicked`, `barClicked`, `sliceClicked`,
    `itemClicked`). Click outputs emit a copy of the item, so this is how to trace one back to its
    record when `key` or `image` isn't unique.
  - Docs: an "Item ids" section on the Data Contract page, linked from each chart's click output.

<a name="22.2.19"></a>
# [v22.2.19]

### Added
  - A proximity chart, `<pcac-proximity-chart>` (`PcacProximityChart`, `PcacProximityChartConfig`):
    one item in the middle (`center`) and others (`data`) around it, each closer in or further out by
    its `value` - a similarity or a distance, set by `closeValue` / `farValue`. Optional dashed guide
    `rings` labelled in `format`, spokes and names under the items (`showLabels`); images in place
    of dots, tooltips, keyboard access, `itemClicked`, `colorOverride` and `heightFull`. The guides'
    and labels' colors are CSS custom properties, for a dark background say:
    `--pcac-proximity-ring-color`, `--pcac-proximity-ring-label-color`,
    `--pcac-proximity-spoke-color`, `--pcac-proximity-label-color` and
    `--pcac-proximity-label-halo-color` (the outline that keeps a line behind a name from cutting
    through it - set it to the background).
  - A dot plot chart, `<pcac-dot-plot-chart>` (`PcacDotPlotChart`, `PcacDotPlotChartConfig`): every
    point placed along one value axis, with points that share a value - or fall in the same
    `binWidth` bin - stacked into a column above it. Takes the plot chart's series-of-points data,
    draws a point's `image` in place of its dot (sized by `pointImage`), and shrinks every mark
    evenly when the tallest column wouldn't fit. Tooltips, keyboard access, `dotClicked`,
    `colorOverride`, `heightFull` and the x axis's styling work as on the other charts.
  - Reference lines and corner labels on the line, area and plot charts:
    - `referenceLines`: dashed lines at chosen values on either axis - a target, a threshold, a
      median - each with an optional label and color. They sit over the grid and under the
      series, and move with zoom.
    - `cornerLabels`: text in the plot's four corners, naming the regions it divides into (the
      quadrants two reference lines make, say). Pinned to the frame, so zoom leaves them alone.

    Both take their colors through CSS custom properties like the axis colors
    (`--pcac-reference-line-color`, `--pcac-corner-label-color`), and both are hidden from screen
    readers like the grid, so a chart whose lines carry meaning should say so in its `ariaLabel`.
  - Point gauges on the line, area and plot charts: give a point a `gauge` and set `pointGauge` on
    the config, and a ring around its dot or image fills clockwise as a share of `pointGauge.max` -
    a third number per point on a two-measure scatter. Points without a `gauge` get no ring. The
    ring moves with zoom and fan-out, and fan-out spacing and edge space grow to fit it. Its colors
    are `--pcac-point-gauge-color` (the series' color by default) and
    `--pcac-point-gauge-track-color`; with a `name`, each point's screen reader name reads the
    gauge too ("…, PSA 0.018").
  - Docs: pages for the dot plot and proximity charts, reference lines, corner labels and point
    gauges on the Plot Chart page, and examples of all four on the Charts page.

<a name="22.2.18"></a>
# [v22.2.18]

### Added
  - Three more colors you can set with CSS custom properties, like the axis and grid colors -
    for a page with a dark background, say:
    - `--pcac-focus-ring-color`: the keyboard focus ring (and a focused slice's outline);
    - `--pcac-crosshair-line-color` and `--pcac-crosshair-text-color`: the line and area charts'
      hover crosshair.

    Each defaults to the gray it used before.
  - A chart with no `ariaLabel` is named with its axis titles as well as its type - "Bar chart -
    x axis: Product, y axis: Units sold". The titles are hidden from screen readers where they're
    drawn, so this is where they're read.

### Changed
  - The bar chart components are `PcacBarVerticalChart` and `PcacBarHorizontalChart`, without the
    `Component` suffix every other chart dropped. The old names still work, as the same classes,
    and are deprecated; they'll be removed in a later version.
  - `colorOverride` is optional on every chart's config. It was required on the bar, line, area
    and plot configs, so a typed object literal had to spell out `colorOverride: []`.
  - The bar components' `buildChart()` and `chartElm`, the pie, donut, line, area and plot
    components' `types`, and the legend's `colorService` are no longer public. None of them was
    meant to be used from outside.
  - `@angular/common` is no longer a peer dependency; the library never imported it.
  - The package marks its `.css` and `.scss` files as having side effects, so a bundler doesn't
    drop an `import '@pioneer-code/pioneer-charts/themes/pioneer-charts.css'`.
  - The legend's hover animation is off when the user has asked to reduce motion, and a legend
    without a heading no longer renders an empty heading element.

### Fixed
  - Keyboard use:
    - A chart that redraws - a click handler updating its data, a resize, live data - keeps
      keyboard focus on the same bar, slice or point. It used to drop focus to the top of the page.
    - Escape stops once it has hidden a tooltip, so it doesn't also close a dialog the chart is
      in; a second Escape goes on as usual.
    - Keys pressed with Alt, Ctrl or Cmd are left to the browser (Alt+Left is Back again).
    - Pressing the pointer on a mark releases a mark in the same chart that had keyboard focus,
      which stayed highlighted.
  - A `format` on a bar chart's category axis turned text keys into `NaN%` or `Chipsm`. It now
    formats only keys that are numbers, and the horizontal chart sizes its labels with the format.
  - Grouped bars whose series keys don't tell them apart - left `null`, or repeated - were drawn
    on top of each other. Each now has its own slot, by its place in the group.
  - A zoom or pan still under way when a line, area or plot chart redrew moved the new drawing
    and replaced the zoom it keeps.
  - The old bar `colorOverride: { colors: [] }` - every bar config's default before 22.2.17 - no
    longer triggers the development warning, which is for colors actually set. The warning comes
    once per chart, like the pie's leftover-`donut` one, rather than once per page.

<a name="22.2.17"></a>
# [v22.2.17]

### Added
  - Charts work from the keyboard and with a screen reader:
    - Each chart is one Tab stop. Inside it, the arrow keys move from bar to bar (slice, point),
      and Home and End go to the first and last. Marks that aren't shown - a hidden series or
      bar, a point zoomed out of view - are skipped.
    - A focused bar, slice or point is highlighted and shows its tooltip, as under the pointer,
      with a focus ring (`[data-pcac-mark]:focus-visible` in the theme). Escape hides the
      tooltip.
    - Enter or Space does what a click does: `barClicked`, `sliceClicked` or `dotClicked` emits.
    - Each mark is announced by its key and value, formatted as its axis is - "Chips, Week 3:
      125". Axes, grid lines and the hover crosshair are hidden from screen readers. With a
      `pcacTooltip` template, the focused mark is also described by the tooltip.
    - A legend is a group named by its heading.
  - Charts are drawn without animation when the user has asked their system to reduce motion.
  - Line, area and plot charts keep their zoom when they redraw - a new config, a series toggled
    in a legend, a resize (which keeps the same part of the domain in view). Turning zoom off,
    or changing which axes zoom, starts the chart unzoomed again.

### Changed
  - **Breaking.** A bar chart's `colorOverride` is a plain array of colors, as it is on every
    other chart:

    ```ts
    // Before
    colorOverride: { colors: ['#3949ab', '#5c6bc0'] }
    // After
    colorOverride: ['#3949ab', '#5c6bc0']
    ```

    `PcacBarVerticalChartColorOverrideConfig` and `PcacBarHorizontalChartColorOverrideConfig` are
    removed. A config still shaped the old way - which TypeScript misses when it's spread together
    or loaded as JSON - is still read, and development builds warn about it once.
  - **Breaking for code or tests that read it.** A chart's `<svg>` is `role="group"` rather than
    `role="img"`, still named by `ariaLabel`: an image's contents are hidden from screen readers,
    and the bars, slices and points inside now have names and take focus of their own.

### Removed
  - **Breaking.** `PcacColorService.setPrimary()`, deprecated since no chart ever read the color
    it set.

### Fixed
  - The library builds against `@types/d3-selection` 3.0.12, whose stricter event typings
    rejected some of its event handlers.

<a name="22.2.16"></a>
# [v22.2.16]

### Added
  - `PcacDonutChart` (`<pcac-donut-chart>`) with `PcacDonutChartConfig`: the donut is now a chart
    of its own rather than an option on the pie. The ring settings - `innerRadius`, `label`,
    `subLabel`, `labelColor` and `subLabelColor` - sit directly on its config. It's announced to
    screen readers as "Donut chart" when `ariaLabel` isn't set.

### Changed
  - **Breaking.** The pie and donut charts are split, the way line, area and plot are:
    - `PcacPieChartComponent` is renamed `PcacPieChart`. Its selector, `<pcac-pie-chart>`, and its
      `sliceClicked` output are unchanged.
    - `PcacPieChartConfig` no longer has `donut`, and `PcacPieDonutConfig` is removed. Move a
      donut to `<pcac-donut-chart>`, with the old `donut` fields on the config itself:

      ```ts
      // Before
      config: PcacPieChartConfig = { data, donut: { innerRadius: 0.7, label: '67' } };
      // <pcac-pie-chart [config]="config" />

      // After
      config: PcacDonutChartConfig = { data, innerRadius: 0.7, label: '67' };
      // <pcac-donut-chart [config]="config" />
      ```

      A pie config that still sets `donut` can compile when it's built through a spread, a
      signal update or loaded JSON, and draws a plain pie. In development the chart logs a
      warning when it sees one.
    - The donut's center classes and custom properties are renamed from `pcac-pie-center*` to
      `pcac-donut-center*`: `.pcac-donut-center`, `.pcac-donut-center-label`,
      `.pcac-donut-center-sub-label`, `--pcac-donut-center-label-color` and
      `--pcac-donut-center-sub-label-color`.
    - The chart's inner `<section>` is now `pcac-pie-donut-chart`. It keeps the
      `pcac-pie-chart` class as well, so styles written against it still apply.
  - Legend items wrap onto another line when the legend is too narrow for them, and are at least
    24px tall, so they're easier to tap. The unused `pcac-legend-item-last` class is gone.
  - The package lists its chart types in its npm keywords.

### Fixed
  - A donut `innerRadius` of `NaN` (from an empty number input, say) drew nothing; it now falls
    back to the default.
  - A chart rendered on the server, where there's no layout to measure, draws nothing rather than
    a chart `NaN` pixels wide.

<a name="22.2.15"></a>
# [v22.2.15]

### Changed
  - Changing the palette through `PcacColorService` (`setScale()` and the other setters) now
    updates legends and redraws charts already on screen, instead of only charts drawn afterwards.
    A redraw replays the chart's enter animation.
  - Default tooltips format values the way their axis labels them for every format: `Minutes`,
    `Decimal` and `OneDayHours` join `Percentage` and `Fahrenheit`, so a tooltip reads `1:30pm`
    next to an axis that does rather than `13.5`. On a `Decimal` x axis the key is formatted too.
  - Plot charts no longer draw the hover crosshair (`enableEffects`): with no line to follow, its
    markers sat in the plot's top-left corner.
  - Bar charts draw a negative value as an empty bar rather than an invalid one, and no longer let
    it pull the rest of a stack down.
  - Horizontal bar chart labels take at most half the chart's width; longer ones are shortened
    with "…" instead of squeezing the bars out.
  - The package now includes its `LICENSE`, and its homepage is https://pioneercharts.com.

### Fixed
  - Bar charts:
    - Hovering a bar while it grew in left it part-grown until the next redraw.
    - The horizontal chart's `barClicked` and tooltip handed back copies of the data rather than
      the consumer's own `PcacData` objects.
    - A stacked bar was drawn out of its slot when a series key matched a group key.
    - Grouped bars are colored by series, so groups holding different series match the legend.
    - Labels wider than the container left the horizontal chart with no bars.
    - More categories than pixels drew nothing.
    - Horizontal per-bar thresholds slid in from the top of their group instead of appearing in
      place.
  - Pie chart: hovering a slice during its enter animation morphed it oddly, and a very small pie
    drew inside out or popped a disc out on hover.
  - Line, area and plot charts:
    - The area chart's hover crosshair could read the wrong value, and data not in ascending x
      order (e.g. newest-first dates) gave wrong values on any chart.
    - The crosshair now updates when the chart is zoomed under a still cursor.
    - Zooming during the enter animation snapped lines and areas back to their unzoomed shape.
    - An empty first series flipped the x axis when points are positioned by index.
    - Hover markers took the wrong color after an empty series.
    - A point with an empty-string value drew a dot (and its range) on the baseline.
    - Clip paths could collide between charts that redrew at the same moment.
  - Tooltips shown above the cursor are kept on screen, and a `DateTime` key that isn't a date is
    shown as it is rather than as "Invalid Date".

<a name="22.2.14"></a>
# [v22.2.14]

### Added
  - `ariaLabel` on every chart config: the chart is announced to screen readers as one image
    with that name (its type - "Bar chart", "Pie chart", ... - when it isn't set).

### Changed
  - The D3 modules the charts use are now installed with the package. `d3` and `@types/d3` are
    no longer peer dependencies, and `rxjs ^7.4.0` now is.

### Removed
  - **Breaking for code that imported internals.** Internal chart plumbing is no longer
    exported:
    - the chart builders `BarVerticalChartBuilder`, `BarHorizontalChartBuilder` and
      `PieChartBuilder`, and their `PcacChart` base class (with `PcacTooltipOptions`);
    - `PcacAxisBuilder`, `PcacGridBuilder`, `PcacTooltipBuilder`, `PcacTransitionService` and
      `PcacChartResizeService` (with `IPcacAxisBuilderConfig` and `IPcacGridBuilderConfig`);
    - `resolveAxisConfig`, `axisLabelSpace`, `hasAxisSubLabels`, `PCAC_AXIS_LABEL_SPACE`,
      `PCAC_AXIS_SUB_LABEL_SPACE`, `PcacChartMargin` and `PcacResolvedAxisConfig`.

    These were never meant as public API. What a consumer configures, binds or styles with -
    the components, config/model classes, `PcacColorService` and `PcacTooltipDirective` - is
    unchanged.

<a name="22.2.13"></a>
# [v22.2.13]

### Added
  - Donut option for the pie chart: set `donut` to draw the slices as a ring, with an optional
    label and sub-label in the center (e.g. a total).

<a name="22.2.12"></a>
# [v22.2.12]

### Fixed
  - Line, area and plot charts given fewer `colorOverride` colors than series now repeat them,
    as the default palette does, instead of drawing the extra series with no color.

<a name="22.2.11"></a>
# [v22.2.11]

### Changed
  - Line, area and plot chart tooltips now appear beside the hovered point instead of over it,
    and flip sides to stay on screen.

### Fixed
  - Tooltips near the right edge of the page could be positioned incorrectly.

<a name="22.2.10"></a>
# [v22.2.10]

### Added
  - Point ranges on line, area and plot charts: a point can carry a `range`, drawn as whiskers,
    a box or a fade via the new `pointRange` config.

### Fixed
  - Hovering a point while the chart was animating in left the dot stuck below its value.
  - Plot chart fan-out spokes and anchors now appear after the points finish animating in.

<a name="22.2.6"></a>
# [v22.2.6]

### Added
  - Color options for every axis part (labels, ticks, axis line, grid) and for plot chart fan-out
    spokes and anchors, also settable through CSS custom properties.

<a name="22.2.5"></a>
# [v22.2.5]

### Fixed
  - Wheel-zooming over a point made the chart flicker.
  - A hovered point's tooltip now hides when a zoom or pan starts.

<a name="22.2.4"></a>
# [v22.2.4]

### Fixed
  - Fanned-out points at the edge of the chart no longer spill past the axes.
  - Points, lines and areas no longer show past the axes while zoomed or panned.
  - Points with an x value of `0` are now positioned correctly.
  - Decimal x-axis tick labels keep enough precision when zoomed in.

<a name="22.2.3"></a>
# [v22.2.3]

### Breaking
  - `enableZoom` is renamed `enableZoomX` and now defaults to `false`.

### Added
  - Y-axis zoom on line, area and plot charts (`enableZoomY`).
  - Plot charts can spread out points that share a coordinate (`pointFanOut`).
  - Tooltip templates receive `coincident`: the other points at the hovered point's coordinate.

<a name="22.2.1"></a>
# [v22.2.1]

### Fixed
  - Point images at the edge of the chart are no longer cut off.
  - Zooming all the way back out no longer leaves the chart shifted.

<a name="22.2.0"></a>
# [v22.2.0]

### Breaking
  - Chart-wide axis settings moved into per-axis `xAxis` / `yAxis` objects:

    | Before | After |
    | --- | --- |
    | `numberOfTicks` | `xAxis` / `yAxis`: `ticks` |
    | `hideGrid` | `showGrid: false` on the axis that drew the grid |
    | `hideAxis` | `hide: true` on the affected axis |
    | `domainMax`, `tickFormat` (bar charts) | `domainMax`, `format` on the value axis |
    | `xFormat`, `xDomainMin`, `xDomainMax`, `y…` (line/area/plot) | `format`, `domainMin`, `domainMax` on `xAxis` / `yAxis` |

  - Stacked bar charts now truly stack: each bar's `value` is its own segment.
  - Removed the unused `onResize()` method from chart components, and the unused
    `numberOfTicks` on the pie chart.
  - The default tooltip's styling moved to a new `.pcac-d3-tooltip-default` class.

### Added
  - Per-axis options: grid lines, tick marks, axis line, axis titles and min/mid/max sub-labels.
  - Custom tooltips via `<ng-template pcacTooltip>` on every chart.
  - Images in place of dots on line, area and plot charts (`PcacData.image`, `pointImage`).
  - `heightFull` option to fill the container's height.
  - Charts resize automatically when their container changes size.
  - The theme's Sass colors can be overridden from a consuming app.

### Fixed
  - Many chart fixes, including bar charts with `heightFull`, `colorOverride` and `hideAxis`,
    area chart `hide`, `(dotClicked)` on line and area charts, zooming on date/decimal axes, charts
    that mount while already holding data, and hover effects across multiple charts.
  - Legend items are now keyboard accessible.
  - Deep imports of the theme (`/themes/*`, `/scss/*`) now resolve.
  - Docs site fixes for mobile layout, page navigation and out-of-date examples.

### Internal
  - Added linting and CI; general code cleanup; the docs site no longer uses zone.js or Bootstrap.

<a name="1.0.1"></a>
# [v1.0.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/1.0.1) (2019-06-13)

### Added
  - Update to Angular 8, marking a 1.0 release.
  - Added `onHistoryClicked` action to Table.   

<a name="0.21.0"></a>
# [v0.21.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.21.0) (2019-02-18)

### Added
  - Make individual "actions" configurable in table
  - Add hide column one option to table
  
<a name="0.18.0"></a>
# [v0.18.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.18.0) (2019-01-08)

### Added
  - Spinner component
  
<a name="0.17.0"></a>
# [v0.17.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.17.0) (2018-12-31)

### Added
  - Action Row option to table

<a name="0.16.6"></a>
# [v0.16.6](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.16.6) (2018-12-31)

### Added
  - Pagination component.
  - Dialog component.

<a name="0.15.0"></a>
# [v0.15.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.15.0) (2018-12-19)

### Fix

- Adjusted dependency chain for package
- Migrated to Angular 7.x

<a name="0.14.0"></a>
# [v0.14.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.14.0) (2018-06-07)

### Added
  - Ability to override color options in bar-charts.
  - Ability to spread colors across groups.

<a name="0.13.3"></a>
# [v0.13.3](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.13.3) (2018-05-18)

### Fix

- Stop chart failure on empty data sets.
  - bar-chart
  - line-area-chart
  - pie-chart
  - table
- Fix normalized height of table.
- Responsive concerns in table.

### Features

- Add the ability to enable/disable sticky footer/header independently of each other. 

<a name="0.13.1"></a>
# [v0.13.1](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.13.1) (2018-05-16)

### Fix

- Responsive charts are now compatible with Angular 5.

<a name="0.13.0"></a>
# [v0.13.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.13.0) (2018-05-16)

### Features

- Pie Chart, Bar Chart and Line Area Chart are now responsive.

<a name="0.12.1"></a>
# [v0.12.1](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.12.1) (2018-05-15)

### Fix

- Fix dynamic width/height calcs on bar-charts based on hideAxis being set to true and
a group label being present. 

<a name="0.12.0"></a>
# [v0.12.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.12.0) (2018-05-09)

### Features

- Bar Charts
  - Hide Scales
  - Hide Grids
- Line Area Charts
  - Hide Scales
  - Hide Grids

<a name="0.11.2"></a>
# [v0.11.2](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.11.2) (2018-05-08)

### Fix

- Rxjs imports


<a name="0.11.1"></a>
# [v0.11.1](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.11.1) (2018-05-08)

### Fix

- Import reference error in --prod builds

<a name="0.11.0"></a>
# [v0.11.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.11.0) (2018-05-08)

### Features

- Add event emitters
  - On bar click in bar charts.
  - On dot click in line/area charts.
  - On slice click in pie charts.

<a name="0.10.0"></a>
# [v0.10.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.10.0) (2018-05-07)

### Features

- Migrated to Angular 6.x 

<a name="0.9.0"></a>
# [v0.9.0](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.9.0) (2018-05-03)

### Features

- Bar Chart
  - Added stacked bar charts.
  - Added grouped bar charts.
  - Added thresholds that span the entire chart, groups, or individual bars.
- Added ability to supply a tick-format through configuration.
  - When set, formats axis' and tooltips accordingly. 

<a name="0.8.1"></a>
# [v0.8.1](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.8.1) (2018-04-29)

### Fixes

- Table
  - Clear header cache on re-int of UI.
  - Scoped margin style.
  - Check for UI build when no data is present.
  - Width calc on router switch.

<a name="0.8.0"></a>
# [v0.8.1](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.8.0) (2018-04-27)

### Fixes

- Activate tooltip on mouse move instead of mouseover event.
  - pie-chart
  - bar-chart(s)
- Change selected SVG display types to block in order to remove extra padding applied at the base of SVG.

For details on features included, visit the [v0.8](https://github.com/PioneerCode/pioneer-charts/milestone/4?closed=1) milestone.

<a name="0.7.0"></a>
# [v0.7](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.7.0) (2018-04-25)

### Features

- Add tooltips on value hovers. 
  - Pie Chart
  - Bar Chart (Horizontal and Vertical)
  - Line Area Chart
- Add continuous value UX effects to line-area-chart.
- Add hover UI indicators on pie chart and bar chart.

For details on features included, visit the [v0.7](https://github.com/PioneerCode/pioneer-charts/milestone/2?closed=1) milestone.


<a name="0.6.0"></a>
# [v0.6](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.6.0) (2018-04-23)

### Features

- OnInit load animations for Bar Chart (Horizontal & Vertical), Line Area Chart, and Pie Chart.

For details on features included, visit the [v0.6](https://github.com/PioneerCode/pioneer-charts/milestone/8?closed=1) milestone.


<a name="0.5.0"></a>
# [v0.5](https://github.com/PioneerCode/pioneer-charts/releases/tag/0.5.0) (2018-04-17)

### First Release Of Pioneer Charts!

This inaugural release includes 4 basic charts:

- Bar Chart (Horizontal & Vertical) 
- Table
- Line Area Chart
- Pie Chart

For details on features included, visit the [v0.5 - Initial Release](https://github.com/PioneerCode/pioneer-charts/milestone/1?closed=1) milestone.
