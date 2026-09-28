import { Routes } from '@angular/router';

// Every page has a `title`, a `data.searchTitle` and a `data.description`: PageSeoStrategy (seo.ts)
// turns them into the document title, meta description, Open Graph tags, canonical URL and
// structured data. `title` is the page's short name, as its breadcrumb; `searchTitle` is the fuller
// one search results and link previews show, with the words people search for ("Angular Bar
// Chart", not "Bar Chart"). Every route is pre-rendered
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
        data: { searchTitle: 'Getting Started with Angular Charts', description: 'Install Pioneer Charts, import a chart component and its theme, and render your first Angular chart in a few steps.' },
    },
    {
        path: 'docs/guides/theme', title: 'Theme',
        loadComponent: () => import('./docs/theme/theme.component').then(m => m.ThemeComponent),
        data: { searchTitle: 'Theming Angular Charts', description: 'Customize how Pioneer Charts look: override the Sass variables, set the chart palette, and color axes, grids and guides with CSS custom properties.' },
    },
    {
        path: 'docs/guides/height-full', title: 'Full Height',
        loadComponent: () => import('./docs/height-full/height-full.component').then(m => m.HeightFullComponent),
        data: { searchTitle: 'Full-Height Angular Charts', description: 'Let a Pioneer Charts chart fill its container with heightFull, using its height as a minimum.' },
    },
    {
        path: 'docs/guides/tooltip', title: 'Custom Tooltip',
        loadComponent: () => import('./docs/tooltip/tooltip.component').then(m => m.TooltipComponent),
        data: { searchTitle: 'Custom Chart Tooltips in Angular', description: 'Replace a Pioneer Charts tooltip with your own Angular template using pcacTooltip, with the hovered point, its series or group, and threshold flags bound in.' },
    },
    {
        path: 'docs/guides/axis-styling', title: 'Axis Styling',
        loadComponent: () => import('./docs/axis-styling/axis-styling.component').then(m => m.AxisStylingComponent),
        data: { searchTitle: 'Chart Axis Styling', description: 'Configure chart axes in Pioneer Charts: labels, ticks, tick marks, axis lines, grids and colors.' },
    },
    {
        path: 'docs/guides/data-contract', title: 'Data Contract',
        loadComponent: () => import('./docs/data-contract/data-contract.component').then(m => m.DataContractComponent),
        data: { searchTitle: 'Chart Data Contract', description: 'The PcacData shape every Pioneer Charts chart takes - key, value, hide and nested data - and the base configuration all the charts share.' },
    },
    {
        path: 'docs/components/charts/legend', title: 'Legend',
        loadComponent: () => import('./docs/legend/legend.component').then(m => m.LegendComponent),
        data: { searchTitle: 'Angular Chart Legend', description: 'The Pioneer Charts legend component: show chart series and react when a legend item is clicked.' },
    },
    {
        path: 'docs/components/charts/bar-chart', title: 'Bar Chart',
        loadComponent: () => import('./docs/bar-chart/bar-chart.component').then(m => m.BarChartComponent),
        data: { searchTitle: 'Angular Bar Chart', description: 'Vertical and horizontal Angular bar charts - single, grouped and stacked, with thresholds - from Pioneer Charts.' },
    },
    {
        path: 'docs/components/charts/area-chart', title: 'Area Chart',
        loadComponent: () => import('./docs/plot-line-area/area/area-chart.component').then(m => m.AreaChartComponent),
        data: { searchTitle: 'Angular Area Chart', description: 'An Angular area chart from Pioneer Charts, with zoom, hover effects, point images and ranges.' },
    },
    {
        path: 'docs/components/charts/line-chart', title: 'Line Chart',
        loadComponent: () => import('./docs/plot-line-area/line/line-chart.component').then(m => m.LineChartComponent),
        data: { searchTitle: 'Angular Line Chart', description: 'An Angular line chart from Pioneer Charts, with zoom, hover effects, point images and ranges.' },
    },
    {
        path: 'docs/components/charts/plot-chart', title: 'Plot Chart',
        loadComponent: () => import('./docs/plot-line-area/plot/plot-chart.component').then(m => m.PlotChartComponent),
        data: { searchTitle: 'Angular Scatter Plot Chart', description: 'An Angular scatter (plot) chart from Pioneer Charts, with zoom, fan-out for overlapping points, and ranges.' },
    },
    {
        path: 'docs/components/charts/pie-chart', title: 'Pie Chart',
        loadComponent: () => import('./docs/pie-chart/pie-chart.component').then(m => m.PieChartComponent),
        data: { searchTitle: 'Angular Pie Chart', description: 'An Angular pie chart from Pioneer Charts, with animated transitions and click events for each slice.' },
    },
    {
        path: 'docs/components/charts/donut-chart', title: 'Donut Chart',
        loadComponent: () => import('./docs/donut-chart/donut-chart.component').then(m => m.DonutChartComponent),
        data: { searchTitle: 'Angular Donut Chart', description: 'An Angular donut chart from Pioneer Charts, with a total or other label in its center and animated transitions.' },
    },
    {
        path: 'docs/components/charts/dot-plot-chart', title: 'Dot Plot Chart',
        loadComponent: () => import('./docs/dot-plot-chart/dot-plot-chart.component').then(m => m.DotPlotChartComponent),
        data: { searchTitle: 'Angular Dot Plot Chart', description: 'An Angular dot plot from Pioneer Charts: values stacked into columns along one axis, with binning and images in place of dots.' },
    },
    {
        path: 'docs/components/charts/proximity-chart', title: 'Proximity Chart',
        loadComponent: () => import('./docs/proximity-chart/proximity-chart.component').then(m => m.ProximityChartComponent),
        data: { searchTitle: 'Angular Proximity Chart', description: 'An Angular proximity chart from Pioneer Charts: one item in the middle and its closest matches around it, placed by similarity or distance.' },
    },
    {
        path: 'charts', title: 'Charts',
        loadComponent: () => import('./charts/charts.component').then(m => m.ChartsComponent),
        data: { searchTitle: 'Angular Chart Examples', description: 'Live examples of every Pioneer Charts chart for Angular - bar, line, area, plot, pie and donut - with legends, zoom, thresholds and custom colors.' },
    },
    // Any other URL shows the home page, but isn't a page of its own: PageSeoStrategy marks it
    // `noindex` so a mistyped link can't be indexed as a copy of the home page.
    { path: '**', loadComponent: () => import('./home/home').then(m => m.Home), data: { notFound: true } },
];
