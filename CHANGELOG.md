<a name="22.3.0"></a>
# [v22.3.0]

### Added
  - Plot charts can spread out points that share a coordinate. Set `pointFanOut` on
    `PcacPlotChartConfig` (`{}` for the defaults) and each group of coincident points is placed
    evenly around a ring on their shared coordinate - a pair straight up and down, larger groups
    clockwise from the top - sized so neighbours sit `gap` px apart (or at a fixed `radius`), with
    an anchor dot and spokes marking the true value (`showAnchor`). Previously such points were
    drawn on top of one another, leaving only the last series' visible and hoverable. The offset
    is applied inside each point's group, so zoom is unaffected, and the chart reserves edge space
    for the fan-out the same way it does for point images. See `PcacPointFanOutConfig`.
  - The tooltip context (`PcacTooltipContext`) gains `coincident`: every other point drawn at the
    hovered point's coordinate, each with its own `data` / `parent` / `index` / `parentIndex`, so a
    template can list who else is there. Set by the line, area and plot charts whether or not
    `pointFanOut` is on; empty elsewhere. `PcacTooltipOptions` takes it as an optional field, and
    `PcacTooltipCoincident` is exported for typing.
  - The docs site's Plot Chart page demonstrates both, with a tooltip template that lists the
    other series at a fanned-out point.

<a name="22.2.1"></a>
# [v22.2.1]

### Fixed
  - Line, area and plot chart point images at the edge of the domain (the top of the y range, or
    either end of the x range) were cut off by the `<svg>` whenever the image box was bigger than
    the chart's default margins. The margins now grow to at least half the `pointImage` box on
    every side when any point has an `image`, with the vertical growth taken out of the plot area
    so the chart's total height stays what `height` configured. `PcacChart` gains a
    `reserveEdgeSpace()` helper for this.
  - Zooming a line, area or plot chart and then zooming all the way back out left the chart
    shifted right and down by half its margins - the x domain's min no longer met the y axis and
    its max sat past the right edge. D3's zoom viewport defaulted to the whole `<svg>` (plot plus
    margins) while the translatable area was the plot, so the first gesture centered one inside
    the other; the viewport is now the plot area too.

<a name="22.2.0"></a>
# [v22.2.0]

### Fixed
  - Vertical bar charts with `heightFull` drew their y axis and grid at the configured `height`
    while the bars stretched to the filled height, leaving every bar hanging below the zero line.
  - Bar charts with a `colorOverride` reversed the consumer's own `colors` array in place on every
    build, so the palette flipped back and forth on each resize.
  - Horizontal bar charts double-counted their measured label margin, leaving the plot area
    narrower than the container allowed, and narrower still after the first resize.
  - Area charts now honor a series' `hide` flag; previously the dots disappeared but the fill
    stayed painted.
  - Vertical bar charts with `hideAxis` no longer modify the consumer's `config.height`, and all
    charts restore their default margins on every build - so turning `hideAxis` back off no
    longer draws the axes into zero-width margins.
  - The legend keeps keyboard focus on an item after toggling it with Enter/Space.
  - `(dotClicked)` now fires on `<pcac-line-chart>` and `<pcac-area-chart>`; only the plot chart
    was forwarding it.
  - Horizontal bar chart grid lines follow `numberOfTicks` like the axis does, instead of a fixed
    five.
  - Line/area chart hover effects no longer read the wrong series' path when an empty series
    precedes a non-empty one.
  - Fahrenheit tick labels on the x axis now read ` F`, matching the y axis, instead of `f`.
  - The docs site footer now reads the library version from its package.json instead of a
    hand-maintained (and already stale) literal.
  - The docs site is now usable on mobile: navigation collapses into a toggleable drawer, and the
    header no longer overlaps at narrow widths.
  - "ON THIS PAGE" links on the docs site now actually scroll to the right section, including when
    opening a link directly (deep-linking) - and only the page content scrolls, not the whole page.
  - Charts that mount while already holding data (e.g. behind a loading spinner) now render
    correctly instead of staying blank.
  - Fixed a rare double-draw on initial page load that could restart a chart's entry animation.
  - Fixed hover effects on line/area/plot charts bleeding between multiple charts on the same page.
  - Fixed a crash when hovering an area chart with hover effects enabled.
  - Fixed horizontal bar chart click events always reporting empty data.
  - Fixed a crash and a non-working hover-darken effect on horizontal bar charts.
  - Fixed line/area/plot chart dots at the very start or end of the chart appearing cut in half.
  - Fixed line/area/plot charts rendering every series with no color when their config was
    created with `new` (the default empty `colorOverride` was replacing the theme palette).
  - Fixed line/area/plot chart dots on every series after the first jumping to the wrong x
    position when zooming a chart with the default (index-based) x-axis format.
  - The legend is now keyboard accessible: items can be focused and toggled with Enter or Space,
    and report their checked state to screen readers. Previously they responded only to a mouse.
  - Removed an invisible, broken border style in the docs site footer (leftover from an unused
    dependency).
  - Updated the published README and docs site quick-start example, which were out of date and no
    longer matched how the library is actually used.
  - Deep imports of the library's theme (e.g. `@pioneer-code/pioneer-charts/themes/pioneer-charts.css`
    or `.../scss/pioneer-charts`) failed to resolve under some build tools even though the files
    existed in the published package, because the package's module resolution metadata never
    listed them.
  - Updated the docs site's Theme page, which showed a broken Sass import path and a color-override
    example that didn't actually work (see Added).
  - The docs site's single-bar demo configs asked for a `"Percentage"` format, which never matched
    the enum's lowercase `'percentage'` value; they now do, so those demos show `%` ticks and
    tooltip values as intended.
  - The docs site's footer no longer highlights the wrong section (e.g. showing "Home" as active
    while on a documentation page) after navigating by any means other than clicking a footer link
    itself.

### Breaking
  - The chart-wide `numberOfTicks`, `hideAxis` and `hideGrid` config fields on the bar and
    line/area/plot charts are gone, replaced by the per-axis `xAxis` / `yAxis` objects (see Added).
    Migration:

    | Before | After |
    | --- | --- |
    | `numberOfTicks: n` | `xAxis: { ticks: n }, yAxis: { ticks: n }` (or just the axis that needs it) |
    | `hideGrid: true` | `yAxis: { showGrid: false }` on vertical bar and line/area/plot charts; `xAxis: { showGrid: false }` on the horizontal bar chart |
    | `hideAxis: true` on a vertical bar chart | `yAxis: { hide: true }` (it only ever hid the y axis); add `xAxis: { hide: true }` if there were no group labels to keep |
    | `hideAxis: true` on a horizontal bar chart | `xAxis: { hide: true }` (it only ever hid the x axis) |
    | `hideAxis: true` on a line/area/plot chart | `xAxis: { hide: true }, yAxis: { hide: true }` |

    Hiding is now per axis and works the same way on every chart: the hidden axis's margins (left
    and top for the y axis, bottom and right for the x axis) go to the plot area, so the chart's
    overall size is unchanged. The chart configs now extend a new `PcacAxisChartConfig` base
    (`PcacChartConfig` + `xAxis`/`yAxis`); `IPcacAxisBuilderConfig` takes resolved `xAxis`/`yAxis`
    in place of its old per-field inputs, for anyone calling `PcacAxisBuilder` directly.
  - Likewise, the chart-level format and domain fields moved into the same per-axis objects, so
    every axis chart now spells them the same way: `PcacAxisConfig` gained `format`, `domainMin`
    and `domainMax` (see Added). Migration:

    | Before | After |
    | --- | --- |
    | `domainMax: n` on a vertical bar chart | `yAxis: { domainMax: n }` |
    | `domainMax: n` on a horizontal bar chart | `xAxis: { domainMax: n }` |
    | `tickFormat: f` on a vertical bar chart | `yAxis: { format: f }` |
    | `tickFormat: f` on a horizontal bar chart | `xAxis: { format: f }` |
    | `xFormat: f`, `xDomainMin: a`, `xDomainMax: b` on a line/area/plot chart | `xAxis: { format: f, domainMin: a, domainMax: b }` |
    | `yFormat: f`, `yDomainMin: a`, `yDomainMax: b` on a line/area/plot chart | `yAxis: { format: f, domainMin: a, domainMax: b }` |

    Two defaults changed shape but not effect: the bar charts' `domainMax` (previously required
    on an object literal) now defaults to 100 when omitted, and the line/area/plot charts'
    formats default to `None` rather than `DatasetLength`, which those charts treat identically
    (index-based x positions, unformatted ticks). `PcacAxisBuilder`'s config lost its
    `xFormat`/`yFormat` fields (it reads `xAxis.format`/`yAxis.format`), and
    `PlaChartScalesBuilder.build()` now takes the resolved axes and data instead of a config.
  - `PcacPieChartConfig.numberOfTicks` was removed; the pie chart has no axes and never read it.

### Changed
  - **Breaking:** `isStacked` bar charts now actually stack. Each bar's `value` is its own segment
    and segments are placed end to end in data order, so a group's total is the sum of its values
    and each bar's tooltip reports that bar's own value. Previously every bar was drawn from the
    baseline at its own value and merely overlapped, which only looked stacked if the data was
    pre-accumulated and sorted highest-to-lowest - consumers doing that should switch to passing
    per-segment values (the docs site's stacked mock data has been converted the same way). The
    docs also described this option under the wrong name, `isGroup`.
  - Line/area charts with `enableZoom` now keep their lines on their dots when zoomed on a
    `DateTime` or `Decimal` x axis; the lines used to be repositioned by index regardless of the
    x format.
  - Tooltips are now centered above the cursor based on their rendered size, instead of at a fixed
    offset that assumed the default content's dimensions. The default tooltip's styling moved from
    `.pcac-d3-tooltip` (now just the positioning shell) to a new `.pcac-d3-tooltip-default` class,
    so that a custom `pcacTooltip` template inherits none of it - a consumer overriding the default
    look in CSS should target the new class. Two chart components (horizontal bar and line/area/plot)
    also carried their own copy of the tooltip rule in their global styles, which overrode the
    theme's - and any `$gray-800`/`$white` override of it - whenever one of those charts was on the
    page; those copies are gone, so the theme's tooltip style now applies consistently.
  - **Breaking:** removed the unused, undocumented `onResize()` method from all chart components —
    charts now handle resizing automatically on their own.
  - The docs site no longer depends on zone.js, in line with modern Angular; no changes were needed
    in the chart library itself.
  - Removed an unused dependency (Bootstrap) from the project.
  - Simplified how the docs site's styles reference the library's shared theme colors, and removed
    some dead CSS, including an unused color-map variable that was left over from the same
    abandoned Bootstrap integration.

### Added
  - Per-axis configuration: the bar (vertical and horizontal) and line/area/plot chart configs now
    take `xAxis` and `yAxis`, each a `PcacAxisConfig` (`{ hide, showGrid, ticks, tickSize,
    showLine, label, subLabels }`, every field optional). Five of those are new:
    - `showGrid` turns the grid lines from that axis's ticks on or off - so every chart can now
      draw a grid on both axes (vertical lines from the x axis, horizontal from the y), including
      through each category of a category axis. Left unset, a chart draws the one grid it always
      has, and no other. On line/area/plot charts the x axis's grid follows zoom.
    - `tickSize` draws tick marks along that axis at the given length in pixels. Charts have never
      shown tick marks (the theme hides them), and still don't unless this is set - so existing
      charts are unaffected; `0` keeps them off but pulls the labels in. Labels follow the marks
      and the chart's margins grow to match, so the plot area shrinks to fit them; the axis line's
      end-caps are unaffected.
    - `showLine` draws a solid line along that axis (D3's domain path). Off by default; independent
      of the tick marks. Axes are now drawn above the chart's content (bars, lines, areas) so the
      line isn't covered by anything sitting at the axis, with the line/area/plot charts' dots
      kept above the axes so a point on the axis stays whole.
    - `label` titles the axis: drawn centered along it at the chart's edge (below the x axis's
      tick labels; rotated to read bottom-to-top left of the y axis's), with the margin growing
      18px to fit it. Styled by a new `.pcac-axis-label` theme rule.
    - `subLabels: { min?, mid?, max? }` places up to three short labels by position along the
      axis - start, center, end - in their own row between the tick labels and the `label`,
      anchored inside the axis's span (rotated along the y axis). The margin grows 16px while any
      is set. Styled by a new `.pcac-axis-sub-label` theme rule.

    Both take the theme's `$gray-900` via new `.pcac-axis-tick-marks .tick line` and
    `.pcac-axis-line .domain` rules. The docs site has a new "Axis Styling" guide with a live demo.
    The other three fields replace `numberOfTicks`, `hideAxis` and `hideGrid` - see Breaking.
  - `PcacAxisConfig` also carries the axis's `format` (a `PcacFormatEnum`, default `None`) and
    `domainMin`/`domainMax` (defaults 0 and 100), replacing the bar charts' `domainMax`/`tickFormat`
    and the line/area/plot charts' `xFormat`/`yFormat`/`xDomainMin`/`xDomainMax`/`yDomainMin`/
    `yDomainMax` - see Breaking for the mapping. Each does what its chart-level predecessor did:
    on a bar chart only the value axis reads them, and only `domainMax` (bars grow from 0); on the
    line/area/plot charts `xAxis.format` still decides how a point's `key` becomes an x position,
    with `domainMin`/`domainMax` read under `Decimal` and `DateTime`.
  - Custom tooltips: project an `<ng-template pcacTooltip>` into any chart (bar, line, area, plot,
    pie) and it is rendered in place of the default key/value tooltip, as a real Angular template
    with the hovered `PcacData` bound in (`let-point`), plus its `parent` group/series and an
    `isThreshold` flag for bar chart threshold markers. The template owns the whole box: the
    library only positions it and applies none of its own styling. Import `PcacTooltipDirective`
    to use it; see the docs site's new "Custom Tooltip" guide.
  - The tooltip template context now also carries `index` (the hovered datum's position in
    `parent.data`, or in the top-level `data` for a pie slice) and `parentIndex` (the parent's
    position in `data`, `null` when there is no parent). Since charts never reorder `data`, a
    template can use them to reach back into whatever collection the `PcacData` was built from
    (`items[parentIndex][index]`) and show fields the chart itself knows nothing about. For
    builders, `PcacTooltipOptions.index` is required and `parentIndex` is optional.
  - Line, area and plot charts can now draw an image at a data point instead of its dot: set
    `image` (a URL or data URI) on the point's `PcacData`, and optionally `pointImage: { maxWidth,
    maxHeight }` on the chart config to size it (defaults to 16 x 16). The image is scaled to fit
    that box with its aspect ratio preserved, is centered on the point, animates in with the other
    points, follows zoom, and gets the same tooltip and `(dotClicked)` behavior as a dot. Points
    without an `image` keep their dot, so the two can be mixed within a series.
  - New `heightFull` chart config option: when true, `height` becomes a *minimum* height and the
    chart grows to fill its container whenever that container is taller, staying filled as the
    container resizes. Give the element wrapping the chart a definite height and turn it on. Not
    supported on the pie chart, where `height` sizes the radius rather than a drawing area.
  - Charts now automatically resize themselves when their container's size changes, not just on
    browser window resize.
  - The library's theme colors can now actually be overridden from a consuming app's own Sass, as
    the docs already claimed but didn't fully support.

### Internal
  - Added linting (angular-eslint) with a config tuned for this codebase's D3 usage, plus a CI
    workflow that runs lint, tests and both builds on every push and pull request - previously
    nothing was enforced automatically.
  - General code cleanup: stronger typing across chart builders, simplified change-detection
    handling, more consistent internal structure between chart types, and removal of some unused
    code.

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
