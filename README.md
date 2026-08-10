# Pioneer Charts

## Documentation

See the [docs site](https://charts.pioneercode.com) for guides, API reference, and examples.

## Overview

Pioneer Charts is an Angular library for building beautiful, customizable, and responsive data visualizations. It leverages [D3.js](https://d3js.org/) for rendering and supports a variety of chart types including bar, line/area, pie, and more.

## Features

- Beautiful default theme, easily customizable via SCSS.
- Supports Bar, Line/Area, Pie charts, and Legends.
- Event emitters for user interaction.
- Strongly typed configuration contracts.
- Standalone components — no `NgModule`s required.
- Automatic chart resizing as its container's size changes.
- Zoneless-compatible.
- Open source and actively maintained.

## Requirements

- Angular ^22.0.0
- D3 ^7.9.0

## Quick Start

### 1. Install Pioneer Charts

```bash
npm install --save @pioneer-code/pioneer-charts
```

### 2. Import Components

Pioneer Charts components are standalone — import the ones you need directly in your component:

```typescript
import { PcacBarVerticalChartComponent, PcacLineChart } from '@pioneer-code/pioneer-charts';

@Component({
  selector: 'app-dashboard',
  imports: [
    PcacBarVerticalChartComponent,
    PcacLineChart,
    // ...other components
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent { }
```

### 3. Import Styles

Add the Pioneer Charts CSS to your global styles:

```scss
@import "@pioneer-code/pioneer-charts/themes/pioneer-charts.css";
```

#### Customizing the theme

Prefer a Sass build instead? Import the source directly and override any of its color variables:

```scss
@use "@pioneer-code/pioneer-charts/scss/pioneer-charts" with (
  $gray-800: #1a1a2e, // tooltip background
  $white: #f4f4f8,    // tooltip text
);
```

See `@pioneer-code/pioneer-charts/scss/core/theme/imports.scss` for the full list of overridable variables.

## Usage Example

```html
<pcac-bar-vertical-chart [config]="barVerticalChartConfig" (barClicked)="onBarClicked($event)"></pcac-bar-vertical-chart>
```


## License

MIT © [Chad Ramos & Pioneer Code](LICENSE)