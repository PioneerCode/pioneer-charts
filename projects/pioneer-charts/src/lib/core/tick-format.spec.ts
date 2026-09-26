import { scaleBand, scaleLinear } from 'd3-scale';
import { PcacFormatEnum } from './chart.model';
import { axisTickFormat, formatHourOfDay, formatPercent, formatValue } from './tick-format';

describe('formatHourOfDay', () => {
  it('labels whole hours on a 12-hour clock', () => {
    expect([0, 1, 11, 12, 13, 23, 24].map(formatHourOfDay)).toEqual(['12am', '1am', '11am', '12pm', '1pm', '11pm', '12am']);
  });

  it('gives a fractional hour its minutes', () => {
    expect(formatHourOfDay(2.5)).toBe('2:30am');
    expect(formatHourOfDay(13.25)).toBe('1:15pm');
    expect(formatHourOfDay(9.05)).toBe('9:03am');
  });

  it('rounds to the nearest minute, carrying 60 minutes into the next hour', () => {
    expect(formatHourOfDay(1.9999)).toBe('2am');
    expect(formatHourOfDay(23.9999)).toBe('12am');
  });

  it('wraps past a day, and before it', () => {
    expect(formatHourOfDay(25)).toBe('1am');
    expect(formatHourOfDay(-1)).toBe('11pm');
    expect(formatHourOfDay(-0.5)).toBe('11:30pm');
  });
});

describe('formatPercent', () => {
  it('reads a fraction as a percentage, without trailing zeros or floating-point noise', () => {
    expect(formatPercent(0.25)).toBe('25%');
    expect(formatPercent(0.07)).toBe('7%');
    expect(formatPercent(0.125)).toBe('12.5%');
  });
});

describe('formatValue', () => {
  it('formats a value the way an axis in each format labels it', () => {
    expect(formatValue(PcacFormatEnum.Percentage, 0.5)).toBe('50%');
    expect(formatValue(PcacFormatEnum.Decimal, 1234567.5)).toBe('1,234,567.5');
    expect(formatValue(PcacFormatEnum.OneDayHours, 13.5)).toBe('1:30pm');
    expect(formatValue(PcacFormatEnum.Minutes, 5)).toBe('5m');
    expect(formatValue(PcacFormatEnum.Fahrenheit, 72)).toBe('72 F');
  });

  it('reads numeric strings as numbers', () => {
    expect(formatValue(PcacFormatEnum.Percentage, '0.5')).toBe('50%');
    expect(formatValue(PcacFormatEnum.OneDayHours, '13')).toBe('1pm');
  });

  it('returns null for the formats with no labelling of their own', () => {
    for (const format of [undefined, PcacFormatEnum.None, PcacFormatEnum.DatasetLength, PcacFormatEnum.DateTime]) {
      expect(formatValue(format, 5)).toBeNull();
    }
  });

  it('returns null when a numeric format is given something that isn\'t a number', () => {
    for (const value of ['', '  ', 'n/a', null, undefined, NaN]) {
      expect(formatValue(PcacFormatEnum.Percentage, value)).toBeNull();
      expect(formatValue(PcacFormatEnum.Decimal, value)).toBeNull();
      expect(formatValue(PcacFormatEnum.OneDayHours, value)).toBeNull();
    }
  });
});

describe('axisTickFormat', () => {
  const linear = scaleLinear().domain([0, 1]);

  it('keeps D3\'s default labels for the formats with none of their own', () => {
    expect(axisTickFormat(undefined, linear, 5)).toBeNull();
    expect(axisTickFormat(PcacFormatEnum.None, linear, 5)).toBeNull();
    expect(axisTickFormat(PcacFormatEnum.DateTime, linear, 5)).toBeNull();
  });

  it('takes a continuous scale\'s precision from its tick step', () => {
    expect(axisTickFormat(PcacFormatEnum.Percentage, linear, 5)!(0.2)).toBe('20%');
    expect(axisTickFormat(PcacFormatEnum.Decimal, scaleLinear().domain([0, 0.1]), 5)!(0.02)).toBe('0.02');
    expect(axisTickFormat(PcacFormatEnum.Decimal, scaleLinear().domain([0, 10000]), 5)!(2000)).toBe('2,000');
  });

  it('formats the band scale of a bar chart\'s category axis without a tick step', () => {
    const band = scaleBand<string>().domain(['0.25', '0.5']);
    expect(axisTickFormat(PcacFormatEnum.Percentage, band, 5)!('0.25')).toBe('25%');
    expect(axisTickFormat(PcacFormatEnum.Decimal, band, 5)!('1500')).toBe('1,500');
  });

  it('labels minutes, degrees and hours of the day', () => {
    expect(axisTickFormat(PcacFormatEnum.Minutes, linear, 5)!(5)).toBe('5m');
    expect(axisTickFormat(PcacFormatEnum.Fahrenheit, linear, 5)!(72)).toBe('72 F');
    expect(axisTickFormat(PcacFormatEnum.OneDayHours, linear, 5)!(13)).toBe('1pm');
  });
});
