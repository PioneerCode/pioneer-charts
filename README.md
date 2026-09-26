# Pioneer Charts

[![CI](https://github.com/PioneerCode/pioneer-charts/actions/workflows/ci.yml/badge.svg)](https://github.com/PioneerCode/pioneer-charts/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@pioneer-code/pioneer-charts)](https://www.npmjs.com/package/@pioneer-code/pioneer-charts)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Pioneer Charts is an Angular library for building beautiful, customizable, and responsive data visualizations. It leverages [D3.js](https://d3js.org/) for rendering and provides bar, line/area, and pie charts, plus a legend component.

## Documentation

Guides, the API reference, live examples, and theming instructions all live on the docs site:

**https://pioneercharts.com**

## Features

- Bar (vertical and horizontal), line, area, plot, and pie charts, plus a legend.
- Beautiful default theme, customizable via CSS or by overriding the source Sass variables.
- Strongly typed configuration contracts.
- Outputs for user interaction (bar, slice, dot, and legend clicks).
- Custom tooltips via a projected template.
- Standalone components — no `NgModule`s required.
- Charts automatically re-render when their container resizes.
- Zoneless-compatible.
- Open source and actively maintained.

## Requirements

- Angular ^22.1.0 (with RxJS ^7.4.0, which Angular itself needs)

The D3 modules the charts use are installed with the package, so there's nothing else to add.

## Installation

```bash
npm install --save @pioneer-code/pioneer-charts
```

Then follow the [Introduction](https://pioneercharts.com) on the docs site to import the components and theme into your app.

## Contributing

Bug reports, feature requests, and pull requests are welcome — see [CONTRIBUTING.md](.github/CONTRIBUTING.md) for the guidelines.

This repository is an Angular workspace containing the library (`projects/pioneer-charts`) and the docs site (`projects/pioneer-charts-docs`). To work on it locally:

```bash
npm ci
npm run build:lib      # build the library into dist/pioneer-charts - the docs site uses that build
npm start              # serve the docs site
npm run lint
npm test               # library unit tests (vitest)
```

The docs site imports the library from `dist/pioneer-charts`, not its source, so it needs `build:lib`
before its first `npm start`. While working on both, run `npm run start-components` alongside
`npm start` to rebuild the library on every change.

Every push and pull request to `main` is verified by [GitHub Actions](https://github.com/PioneerCode/pioneer-charts/actions) (lint, tests, and both builds).

### Releasing

Releases are published to npm by the [Publish workflow](.github/workflows/publish.yml), never from a local machine. Merging a pull request that bumps `version` in `projects/pioneer-charts/package.json` into `main` runs the full test suite and then waits for a maintainer to approve the deployment; once approved, the tested build is published to npm, a matching `v<version>` tag and GitHub Release are created, and the docs site is deployed.

## License

MIT © [Chad Ramos & Pioneer Code](LICENSE)
