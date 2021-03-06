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
