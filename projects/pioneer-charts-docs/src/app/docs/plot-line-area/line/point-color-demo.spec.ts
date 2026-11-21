import { BELOW, freeSpaceConfig, THRESHOLD } from './point-color-demo';

describe('the Line Chart page\'s point color demo', () => {
  it('flags every reading below its threshold, and only those, with its threshold drawn', () => {
    const config = freeSpaceConfig();
    const points = config.data[0].data;

    expect(points.filter((p) => p.color === BELOW).map((p) => p.value)).toEqual([0.09, 0.07, 0.06, 0.08]);
    expect(points.every((p) => (p.color === BELOW) === (Number(p.value) < THRESHOLD))).toBe(true);
    expect(config.referenceLines).toEqual([{ axis: 'y', value: THRESHOLD, label: 'Threshold 10%' }]);
  });

  it('spans its readings on the x axis: a time axis with no domain draws no line', () => {
    const config = freeSpaceConfig();
    const keys = config.data[0].data.map((p) => p.key);

    expect([config.xAxis?.domainMin, config.xAxis?.domainMax]).toEqual([keys[0], keys[keys.length - 1]]);
  });

  it('draws the same thing on every build, so the pre-rendered page matches the browser', () => {
    expect(freeSpaceConfig()).toEqual(freeSpaceConfig());
  });
});
