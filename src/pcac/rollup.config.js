export default [
    {
        input: '../../dist/packages/pcac/src/public-api.js',
        output: {
            file: '../../dist//bundles/pioneer-angular-charts.module.js',
            format: 'umd',
            name: 'pioneer-angular-charts.module.js'
        }
    },
    {
        input: '../../dist/packages/pcac/src/bar-chart/index.js',
        output: {
            file: '../../dist//bundles/pioneer-angular-charts-bar-chart.module.js',
            format: 'umd',
            name: 'pioneer-angular-charts-bar-chart.module.js'
        }
    },
    {
        input: '../../dist/packages/pcac/src/table/index.js',
        output: {
            file: '../../dist//bundles/pioneer-angular-charts-table.module.js',
            format: 'umd',
            name: 'pioneer-angular-charts-table.module.js'
        }
    },
    {
        input: '../../dist/packages/pcac/src/header/index.js',
        output: {
            file: '../../dist//bundles/pioneer-angular-charts-header.module.js',
            format: 'umd',
            name: 'pioneer-angular-charts-header.module.js'
        }
    },
    {
        input: '../../dist/packages/pcac/src/line-area-chart/index.js',
        output: {
            file: '../../dist/bundles/pioneer-angular-charts-line-area-chart.module.js',
            format: 'umd',
            name: 'pioneer-angular-charts-line-area-chart.module.js'
        }
    }
]