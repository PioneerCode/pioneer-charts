<a name="unreleased"></a>
# Unreleased

### Fixed
  - A chart that mounted already holding data (e.g. behind an async/loading gate) could
    silently render nothing: its first build could run before the browser had committed layout
    for the chart's own just-created container, measuring a 0-width and giving up with no way to
    retry. Charts now observe their container via `ResizeObserver` and retry once real layout is
    available.
  - Charts on a normal page load were drawing twice — the fix above's `ResizeObserver` fires once
    routinely as soon as it starts observing, which was landing moments after the chart's first,
    already-successful draw and restarting its enter transition mid-animation. The retry now
    checks the container's actual measured size against the last successful build before
    triggering a rebuild, so it only fires when something has genuinely changed.
  - Multiple `<pcac-line-chart>`/`<pcac-area-chart>`/`<pcac-plot-chart>` instances with
    `enableEffects: true` on the same page shared one `PlaChartEffectsBuilder`, so hovering any of
    them could animate a *different* instance's crosshair/tooltip effect (whichever chart had
    built most recently) instead of the one actually under the cursor. `PlaChartEffectsBuilder`
    is now scoped per chart instance, like every other per-chart builder in the library.
  - Hovering a `<pcac-area-chart>` (`type: 'area'`) with `enableEffects: true` threw
    `TypeError: Cannot read properties of undefined (reading 'getTotalLength')` on every
    mousemove: the crosshair effect always looked for `<path class="line">` to measure positions
    along, but area-type charts draw `<path class="area">` instead, so it never found anything to
    measure. It now recognizes both, and no longer throws at all for chart types (e.g. `plot`)
    that draw neither.

### Changed
  - **Breaking:** removed the public `onResize()` method from `PcacBarVerticalChartComponent`,
    `PcacBarHorizontalChartComponent`, `PcacPieChartComponent`, `PcacLineAreaChartComponent`,
    `PcacLineChart`, `PcacAreaChart`, and `PcacPlotChart`. It was undocumented and unused by any
    known consumer; it's superseded by the automatic `ResizeObserver`-based handling above, which
    also covers layout-driven container resizes (a sidebar collapsing, a tab activating) that
    `window` resize events alone never did.

### Added
  - `PcacChartResizeService` (new, exported from the library's public API).

### Internal
  - The four chart components (`bar-vertical-chart`, `bar-horizontal-chart`, `pie-chart`,
    `plot-line-area-chart`) no longer implement `OnChanges`; they react to their `config` (and,
    for `plot-line-area-chart`, `type`) signal inputs via `effect()` instead. No behavior change
    for existing consumers.
  - Assorted `any` types removed in favor of real ones (`PcacChartMargin`, `SVGGeometryElement`,
    a generic `AxisScale<Domain>`, and the D3 tooltip selection's inferred type).
  - `PlaChartBuilder` is now `@Injectable()` + provided per-component like the other three chart
    builders, instead of `new PlaChartBuilder()`'d manually — see the `PlaChartEffectsBuilder` fix
    above, which this made possible to catch and fix correctly.

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
