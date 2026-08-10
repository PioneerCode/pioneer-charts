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
  - `<pcac-bar-horizontal-chart>`'s `(barClicked)` output always emitted `{ key: undefined, value:
    undefined, ... }`. D3 v6+ passes `.on('click', ...)` callbacks `(event, datum)`, but the handler
    only declared one parameter (named `d`), so it was actually receiving the click's `MouseEvent`
    as `d` — the real datum was silently dropped. Every sibling chart's click handler
    (`bar-vertical-chart`, `pie-chart`, `plot-line-area-chart`) already declared both parameters
    correctly; only `bar-horizontal-chart` had the mismatch. Fixed by adding the missing `_event`
    parameter, matching the other three.
  - Hovering any bar in `<pcac-bar-horizontal-chart>` threw `TypeError: this.transition is not a
    function` (mouseover) followed by `TypeError: Cannot read properties of undefined (reading
    'getTransitionDuration')` (mouseout): both handlers confused the raw DOM element (`this`,
    inside D3's `function (this: any, ...)` callback convention) with the builder instance
    (captured separately as `self`) — mouseover called `.transition()` directly on the element
    outside its `select(...)` wrapper, and both read `.transitionService` off the element instead
    of the builder. The hover-darken effect these were meant to drive had never actually worked.
  - In `plot-line-area-chart`, a dot sitting exactly at the x-domain's minimum or maximum value
    (a very common case — e.g. the first/last point of any line) was rendered half-clipped: its
    clip-path `<rect>` spanned exactly `[0, width]` with no horizontal buffer, so half of a dot's
    radius fell outside it right at either edge (left half missing at the minimum, right half at
    the maximum). The vertical dimension already carried a 10px buffer on each side for the
    identical reason; the horizontal dimension now gets the same treatment.
  - `pioneer-charts-docs`'s `footer.scss` set `border-top: 1px solid theme-color-level("primary", 2)`
    — `theme-color-level()` is a Bootstrap Sass function, and `bootstrap` was never `@use`d/`@import`ed
    anywhere the compiler could see it (only `colors.scss`, which doesn't define it either). Dart
    Sass passed the unrecognized function call through verbatim as invalid CSS rather than erroring
    (confirmed against the actual built bundle:
    `border-top:1px solid theme-color-level("primary",2)`), which the browser then silently dropped,
    leaving the footer with no border at all — this had never actually rendered a border since it
    was written. Removed the declaration outright (and the footer's now-unused `colors.scss`
    import) rather than substituting a real color; see "Changed" below for the `bootstrap`
    dependency itself, which had no other use anywhere in the project.
  - The published `README.md` (copied verbatim into the npm package by `build/readme.js`) and the
    docs site's Introduction page (`introduction.component.ts`/`.html`) both showed a Quick Start
    that doesn't work against the current library: an `@NgModule`-based
    `PcacBarVerticalChartModule`/`PcacLineAreaChartModule` import (no `NgModule` wrappers exist in
    the library — components are standalone) and a `@import "~@pioneer-code/pioneer-charts/pcac.css"`
    styles snippet (the built file is `dist/pioneer-charts/themes/pioneer-charts.css`; no file named
    `pcac.css` is ever produced, and the `~`-prefixed webpack-alias import syntax doesn't apply to
    the Vite-based build this project uses). Both now show the standalone-component import pattern
    (`import { PcacBarVerticalChartComponent, PcacLineChart } from '@pioneer-code/pioneer-charts'`
    used directly in a component's own `imports: [...]`) and the real theme CSS path.

### Changed
  - **Breaking:** removed the public `onResize()` method from `PcacBarVerticalChartComponent`,
    `PcacBarHorizontalChartComponent`, `PcacPieChartComponent`, `PcacLineAreaChartComponent`,
    `PcacLineChart`, `PcacAreaChart`, and `PcacPlotChart`. It was undocumented and unused by any
    known consumer; it's superseded by the automatic `ResizeObserver`-based handling above, which
    also covers layout-driven container resizes (a sidebar collapsing, a tab activating) that
    `window` resize events alone never did.
  - `pioneer-charts-docs` now runs under `provideZonelessChangeDetection()` instead of
    `provideZoneChangeDetection()`; `zone.js` has been removed from its polyfills and
    `package.json` entirely (confirmed gone from the shipped production bundle — the ~35kB
    polyfills chunk no longer exists in the build output). Worth knowing: as of this Angular
    version, zoneless is actually already the framework's own default (`bootstrapApplication` and
    `TestBed` both include zoneless providers unconditionally at baseline; `provideZoneChangeDetection()`
    is what opts *out* of that default). `provideZonelessChangeDetection()` is kept explicit
    anyway because it's the only thing that installs the dev-mode `NG0914` warning for zone.js
    accidentally being reintroduced later, not because it's what made this migration work. The
    library itself required **no code changes** — its `OnPush` + signal-input +
    `outputFromObservable()` architecture (see
    CLAUDE.md) was already zoneless-compatible by construction, not by luck: Angular's own
    compiled output-listener wrapping notifies the change-detection scheduler whenever a bound
    `(output)="..."` fires, regardless of what triggered the underlying emission — including a
    D3-native `.on('click', ...)` DOM listener, which is how every chart's click output
    (`barClicked`/`sliceClicked`/`dotClicked`) originates. This was verified directly, not just
    argued: a plain, non-signal component field updated only inside a `(barClicked)` handler was
    confirmed to correctly re-render, live, against a build with `zone.js` genuinely absent (not
    just DI-overridden) — a signal-backed field wouldn't have proven the same thing, since a
    signal re-renders via its own reactivity regardless of whether the output itself notified
    anything. Also added `provideCheckNoChangesConfig({ exhaustive: true, interval: 5000 })` as a
    standing (dev-only) regression guard against any future OnPush binding silently going stale.

  - Removed the `bootstrap` devDependency entirely. Its only reference anywhere in the project was
    the broken `footer.scss` declaration fixed above; nothing else in either project's source used
    it (grepped for `bootstrap`/`theme-color-level`/any Bootstrap Sass `@use`/`@import` — the only
    matches left after the fix are `bootstrapApplication` calls and an unrelated "app bootstrap"
    comment in `main.ts`/`app.ts`, both just naming collisions with Angular's own vocabulary).
  - Added `stylePreprocessorOptions.includePaths: ["projects/pioneer-charts"]` to
    `pioneer-charts-docs`'s build options in `angular.json`, so any docs-app SCSS file can import
    the library's `colors.scss` as `@use "colors";` instead of a deep relative path — one file
    (`jump-nav.scss`) needed `../../../../../../pioneer-charts/colors.scss` to reach it. Updated
    `styles.scss`, `app.scss`, `home.scss`, `jump-nav.scss`, and `navigation.scss` to the shortened
    form; the namespace (`colors.$primary`, `colors.$accent`, etc.) is unchanged since Sass derives
    it from the filename either way.
  - `navigation.scss`: removed a dead `::ng-deep .pcac-navigation-active-link
    span.mdc-list-item__primary-text { }` rule that contained only a commented-out `!important`
    declaration and compiled to nothing.

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
