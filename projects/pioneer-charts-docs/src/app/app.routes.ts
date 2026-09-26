import { Routes } from '@angular/router';

// Every page has a `title` and a `data.description`: PageSeoStrategy (seo.ts) turns them into the
// document title, meta description, Open Graph tags and canonical URL. Every route is pre-rendered
// at build time (app.routes.server.ts) and listed in sitemap.xml (build/docs-pages.js), so a new
// page only needs adding here.
export const routes: Routes = [
    {
        path: '',
        // No title or description of its own: the home page takes the site's defaults (seo.ts).
        loadComponent: () => import('./home/home').then(m => m.Home),
    },
    {
        path: 'docs/guides/introduction', title: 'Getting Started',
        loadComponent: () => import('./docs/introduction/introduction.component').then(m => m.IntroductionComponent),
        data: { description: 'Install Pioneer Charts, import a chart component and its theme, and render your first Angular chart in a few steps.' },
    },
    {
        path: 'docs/guides/theme', title: 'Theme',
        loadComponent: () => import('./docs/theme/theme.component').then(m => m.ThemeComponent),
        data: { description: 'Customize how Pioneer Charts look: override the Sass variables, set the chart palette, and color axes, grids and guides with CSS custom properties.' },
    },
    {
        path: 'docs/guides/height-full', title: 'Full Height',
        loadComponent: () => import('./docs/height-full/height-full.component').then(m => m.HeightFullComponent),
        data: { description: 'Let a Pioneer Charts chart fill its container with heightFull, using its height as a minimum.' },
    },
    {
        path: 'docs/guides/tooltip', title: 'Custom Tooltip',
        loadComponent: () => import('./docs/tooltip/tooltip.component').then(m => m.TooltipComponent),
        data: { description: 'Replace a Pioneer Charts tooltip with your own Angular template using pcacTooltip.' },
    },
    {
        path: 'docs/guides/axis-styling', title: 'Axis Styling',
        loadComponent: () => import('./docs/axis-styling/axis-styling.component').then(m => m.AxisStylingComponent),
        data: { description: 'Configure chart axes in Pioneer Charts: labels, ticks, tick marks, axis lines, grids and colors.' },
    },
    {
        path: 'docs/guides/data-contract', title: 'Data Contract',
        loadComponent: () => import('./docs/data-contract/data-contract.component').then(m => m.DataContractComponent),
        data: { description: 'The PcacData shape and base chart configuration shared by every Pioneer Charts chart.' },
    },
    {
        path: 'docs/components/charts/legend', title: 'Legend',
        loadComponent: () => import('./docs/legend/legend.component').then(m => m.LegendComponent),
        data: { description: 'The Pioneer Charts legend component: show chart series and react when a legend item is clicked.' },
    },
    {
        path: 'docs/components/charts/bar-chart', title: 'Bar Chart',
        loadComponent: () => import('./docs/bar-chart/bar-chart.component').then(m => m.BarChartComponent),
        data: { description: 'Vertical and horizontal Angular bar charts - single, grouped and stacked, with thresholds - from Pioneer Charts.' },
    },
    {
        path: 'docs/components/charts/area-chart', title: 'Area Chart',
        loadComponent: () => import('./docs/plot-line-area/area/area-chart.component').then(m => m.AreaChartComponent),
        data: { description: 'An Angular area chart from Pioneer Charts, with zoom, hover effects, point images and ranges.' },
    },
    {
        path: 'docs/components/charts/line-chart', title: 'Line Chart',
        loadComponent: () => import('./docs/plot-line-area/line/line-chart.component').then(m => m.LineChartComponent),
        data: { description: 'An Angular line chart from Pioneer Charts, with zoom, hover effects, point images and ranges.' },
    },
    {
        path: 'docs/components/charts/plot-chart', title: 'Plot Chart',
        loadComponent: () => import('./docs/plot-line-area/plot/plot-chart.component').then(m => m.PlotChartComponent),
        data: { description: 'An Angular scatter (plot) chart from Pioneer Charts, with zoom, fan-out for overlapping points, and ranges.' },
    },
    {
        path: 'docs/components/charts/pie-chart', title: 'Pie Chart',
        loadComponent: () => import('./docs/pie-chart/pie-chart.component').then(m => m.PieChartComponent),
        data: { description: 'Angular pie and donut charts from Pioneer Charts, with animated transitions.' },
    },
    {
        path: 'charts', title: 'Charts',
        loadComponent: () => import('./charts/charts.component').then(m => m.ChartsComponent),
        data: { description: 'A gallery of every Pioneer Charts chart type rendered live.' },
    },
    // Any other URL shows the home page, but isn't a page of its own: PageSeoStrategy marks it
    // `noindex` so a mistyped link can't be indexed as a copy of the home page.
    { path: '**', loadComponent: () => import('./home/home').then(m => m.Home), data: { notFound: true } },
];
