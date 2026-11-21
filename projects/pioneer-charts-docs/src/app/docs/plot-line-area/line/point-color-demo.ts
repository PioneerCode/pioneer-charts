import { PcacData, PcacFormatEnum, PcacLineChartConfig } from '@pioneer-code/pioneer-charts';

/** The threshold the demo's readings are flagged below, as a share. */
export const THRESHOLD = 0.1;
/** The color a reading below it is drawn in. */
export const BELOW = '#bb2d3b';

/**
 * The Line Chart page's point color demo: a disk's free space every 4 hours over two days, filling
 * until a clear-out, with the readings below a 10% threshold flagged red. Fixed, so the pre-rendered
 * page and the browser draw the same thing.
 */
const FREE = [0.34, 0.3, 0.27, 0.22, 0.18, 0.15, 0.12, 0.09, 0.07, 0.06, 0.08, 0.41, 0.4];
const START = Date.UTC(2026, 10, 18);
const HOUR_MS = 60 * 60 * 1000;

export function freeSpaceConfig(): PcacLineChartConfig {
  const points: PcacData[] = FREE.map((free, i) => ({
    key: new Date(START + i * 4 * HOUR_MS).toISOString(),
    value: free,
    hide: false,
    data: [],
    ...(free < THRESHOLD ? { color: BELOW } : {}),
  }));
  return {
    ...new PcacLineChartConfig(),
    height: 200,
    ariaLabel: 'Free space over two days: below the 10% threshold for four readings, then cleared to 41%',
    data: [{ key: 'Free space', value: null, hide: false, data: points }],
    xAxis: {
      format: PcacFormatEnum.DateTime,
      domainMin: points[0].key as string,
      domainMax: points[points.length - 1].key as string,
    },
    yAxis: { format: PcacFormatEnum.Percentage, domainMin: 0, domainMax: 0.5 },
    referenceLines: [{ axis: 'y', value: THRESHOLD, label: 'Threshold 10%' }],
  };
}
