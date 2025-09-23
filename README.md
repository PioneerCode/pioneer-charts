# Pioneer Charts

[Docs](https://charts.pioneercode.com)

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

## Development

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name --project pioneer-charts` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project pioneer-charts`.

### Build

Run `ng build pioneer-charts` to build the project. The build artifacts will be stored in the `dist/` directory.

### Publishing

After building your library with `ng build pioneer-charts`, go to the dist folder `cd dist/pioneer-charts` and run `npm publish`.

### Running unit tests

Run `ng test pioneer-charts` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Documentation

See the [docs site](https://github.com/PioneerCode/pioneer-charts) for guides, API reference, and examples.

## License

MIT © [Chad Ramos & Pioneer Code](LICENSE)