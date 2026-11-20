import { PcacData, PcacStateTimelineConfig, PcacStateTimelineState } from '@pioneer-code/pioneer-charts';

/**
 * The State Timeline page's examples, and the chart gallery's: a month of four services' status, by day. A fixed
 * story rather than a random one, and fixed dates rather than today's, so the pre-rendered page and the browser
 * draw the same thing.
 */

export const STATES: PcacStateTimelineState[] = [
  { key: 'ok', label: 'OK' },
  { key: 'warning', label: 'Warning' },
  { key: 'error', label: 'Error' },
];

/** The last day shown. */
const END = Date.UTC(2026, 10, 20);
const DAY_MS = 24 * 60 * 60 * 1000;

/** What went wrong on a day, `days` back from the last: hours in each state but OK, and hours nothing is known of. */
interface Trouble {
  warning?: number;
  error?: number;
  unknown?: number;
}

/** A day's name, as its tooltip and screen readers say it: `'Fri, Nov 20'`. */
export function dayName(daysBack: number): string {
  return new Date(END - daysBack * DAY_MS)
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

/** A row of `days` days, oldest first: each 24 hours, OK but for its trouble. */
function row(key: string, days: number, trouble: Record<number, Trouble>): PcacData {
  return {
    key, value: null, hide: false,
    data: Array.from({ length: days }, (_, i) => {
      const back = days - 1 - i;
      const { warning = 0, error = 0, unknown = 0 } = trouble[back] ?? {};
      const states: PcacData[] = [
        { key: 'ok', value: 24 - warning - error - unknown, hide: false, data: [] },
        { key: 'warning', value: warning, hide: false, data: [] },
        { key: 'error', value: error, hide: false, data: [] },
      ];
      return { key: dayName(back), value: 24, hide: false, data: states.filter((s) => Number(s.value) > 0) };
    }),
  };
}

/** Four services over the last 30 days: an outage, a slow spell, a device switched off, a backup that failed. */
export function statusHistory(): PcacStateTimelineConfig {
  return {
    ...new PcacStateTimelineConfig(),
    height: 112,
    states: STATES,
    data: [
      row('API', 30, { 21: { error: 3 }, 9: { warning: 5 } }),
      row('Database', 30, { 25: { warning: 2 }, 14: { error: 12 }, 13: { error: 1, warning: 4 } }),
      row('Uploads', 30, { 7: { unknown: 9 }, 6: { unknown: 24 }, 5: { warning: 10, unknown: 6 } }),
      row('Backups', 30, { 19: { error: 24 }, 18: { error: 24 }, 2: { warning: 1 } }),
    ],
  };
}

/** One service, one row and no label: the strip a status card holds, 14px tall. */
export function strip(days = 30): PcacStateTimelineConfig {
  return {
    ...new PcacStateTimelineConfig(),
    height: 14,
    rowLabels: false,
    states: STATES,
    data: [row('', days, { 21: { error: 3 }, 9: { warning: 5 }, 47: { error: 20 }, 63: { unknown: 24 }, 64: { unknown: 10 } })],
  };
}

/** How many of a row's days had an Error, and how many a Warning but no Error. */
export function totals(config: PcacStateTimelineConfig): { errors: number; warnings: number } {
  const days = config.data[0]?.data ?? [];
  const had = (day: PcacData, key: string) => day.data.some((s) => s.key === key && Number(s.value) > 0);
  const errors = days.filter((day) => had(day, 'error')).length;
  return { errors, warnings: days.filter((day) => !had(day, 'error') && had(day, 'warning')).length };
}
