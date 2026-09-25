import { AxisDomain, AxisScale } from 'd3-axis';
import { format } from 'd3-format';
import { PcacFormatEnum } from './chart.model';

/** A continuous scale's own `tickFormat`, which picks its precision from the tick step. */
type WithTickFormat<Domain> = AxisScale<Domain> & {
  tickFormat?: (count?: number, specifier?: string) => (d: Domain) => string;
};

/**
 * `Percentage` values are fractions - `0.25` is 25% - on the axis and in the tooltip alike.
 * `~` trims trailing zeros, so 0.07 reads `7%` rather than `7.000000%`.
 */
export const formatPercent = format('~%');

/**
 * An hour of the day, 0-24, on a 12-hour clock: 0 and 24 are `12am`, 13 is `1pm`, and a
 * fractional hour gets its minutes (`2.5` is `2:30am`) rather than reading `2.5am`.
 */
export function formatHourOfDay(value: number): string {
  let totalMinutes = Math.round(value * 60);
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hour24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period = hour24 < 12 ? 'am' : 'pm';
  return minutes === 0 ? `${hour}${period}` : `${hour}:${String(minutes).padStart(2, '0')}${period}`;
}

/**
 * The tick label format for an axis in `format`, shared by both axes (so a format means the same
 * thing on x and y) and by anything that labels a value on that axis, like the line/area hover
 * crosshair. Returns null for the formats that keep D3's default labels.
 *
 * Numeric formats take their precision from the scale's tick step where the scale has one: a
 * fixed precision is fine for a whole domain but breaks down once zoom narrows it to a few units.
 */
export function axisTickFormat<Domain extends AxisDomain>(
  pcacFormat: PcacFormatEnum | undefined,
  scale: AxisScale<Domain>,
  ticks: number | undefined,
): ((d: Domain) => string) | null {
  const withTicks = scale as WithTickFormat<Domain>;
  switch (pcacFormat) {
    case PcacFormatEnum.Percentage:
      return withTicks.tickFormat ? withTicks.tickFormat(ticks, '~%') : (d) => formatPercent(Number(d));
    case PcacFormatEnum.Decimal:
      // Plain numbers with thousands separators - `1,500`, `0.05` - rather than SI prefixes, which
      // turned a differential of 0.05 into `50m` (reading as minutes, like the Minutes format).
      return withTicks.tickFormat ? withTicks.tickFormat(ticks, ',~f') : (d) => format(',~f')(Number(d));
    case PcacFormatEnum.Minutes:
      return (d) => d + 'm';
    case PcacFormatEnum.Fahrenheit:
      return (d) => d + ' F';
    case PcacFormatEnum.OneDayHours:
      return (d) => formatHourOfDay(Number(d));
    default:
      return null;
  }
}
