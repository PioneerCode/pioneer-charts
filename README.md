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
- Open source and actively maintained.

## Quick Start

### 1. Install Pioneer Charts

```bash
npm install --save @pioneer-code/pioneer-charts
```

### 2. Import Component Modules

Import the modules you need in your `AppModule`:

```typescript
import { PcacBarVerticalChartModule, PcacLineAreaChartModule } from '@pioneer-code/pioneer-charts';

@NgModule({
  imports: [
    PcacBarVerticalChartModule,
    PcacLineAreaChartModule,
    // ...other modules
  ],
})
export class AppModule { }
```

### 3. Import Styles

Add the Pioneer Charts CSS to your global styles:

```scss
@import "~@pioneer-code/pioneer-charts/pcac.css";
```

## Usage Example

```html
<pcac-bar-vertical-chart [config]="barVerticalChartConfig" (barClicked)="onBarClicked($event)"></pcac-bar-vertical-chart>
```


## License

MIT © [Chad Ramos & Pioneer Code](LICENSE)