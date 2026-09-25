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
