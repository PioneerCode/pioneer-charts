export default [
    {
        input: 'dist/pcac/index.js',
        output: {
            file: 'dist/bundles/pioneer-angular-charts.module.js',
            format: 'umd',
        }
    },
    {
        input: 'dist/pcac/src/bar-chart/index.js',
        output: {
            file: 'dist/bundles/pioneer-angular-charts-bar-chart.module.js',
            format: 'umd',
        }
    },
    {
        input: 'dist/pcac/src/table/index.js',
        output: {
            file: 'dist/bundles/pioneer-angular-charts-table.module.js',
            format: 'umd',
        }
    },
    {
        input: 'dist/pcac/src/line-area-chart/index.js',
        output: {
            file: 'dist/bundles/pioneer-angular-charts-line-area-chart.module.js',
            format: 'umd',
        }
    },
    {
        input: 'dist/pcac/src/header/index.js',
        output: {
            file: 'dist/bundles/pioneer-angular-charts-header.module.js',
            format: 'umd',
        }
    }
]