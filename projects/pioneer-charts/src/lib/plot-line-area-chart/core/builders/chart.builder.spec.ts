import { TestBed } from '@angular/core/testing';
import { PcacLineAreaChartComponent } from '../../plot-line-area-chart.component';
import { PlaChartBuilder } from './chart.builder';
import { PlaChartEffectsBuilder } from './effects.builders';

/**
 * Regression test: PlaChartEffectsBuilder (enableEffects's hover crosshair) holds mutable
 * per-chart state (config, lines) despite looking like a stateless helper. It used to be masked
 * by PlaChartBuilder manually `new`-ing it up on every build; once PlaChartBuilder switched to
 * inject()ing it instead, that state started getting shared (and clobbered) across every
 * <pcac-line-area-chart> on the page, because PlaChartEffectsBuilder wasn't listed in
 * PcacLineAreaChartComponent's own `providers` - only PlaChartBuilder was. The fix lists both.
 *
 * This deliberately resolves the builders through PcacLineAreaChartComponent's *real* `providers`
 * metadata (not a hand-rolled duplicate) - the whole point is to catch a future edit that drops
 * PlaChartEffectsBuilder from that array again, exactly how the bug happened the first time.
 */
describe('PcacLineAreaChartComponent builder scoping', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [PcacLineAreaChartComponent] });
  });

  it('gives each component instance its own PlaChartBuilder and PlaChartEffectsBuilder', () => {
    const a = TestBed.createComponent(PcacLineAreaChartComponent);
    const b = TestBed.createComponent(PcacLineAreaChartComponent);

    expect(a.debugElement.injector.get(PlaChartBuilder)).not.toBe(b.debugElement.injector.get(PlaChartBuilder));
    expect(a.debugElement.injector.get(PlaChartEffectsBuilder)).not.toBe(b.debugElement.injector.get(PlaChartEffectsBuilder));
  });

  it('resolves PlaChartBuilder\'s own effectsBuilder to the same component-scoped instance', () => {
    const fixture = TestBed.createComponent(PcacLineAreaChartComponent);
    const chartBuilder = fixture.debugElement.injector.get(PlaChartBuilder);
    const effectsBuilder = fixture.debugElement.injector.get(PlaChartEffectsBuilder);

    expect((chartBuilder as unknown as { effectsBuilder: PlaChartEffectsBuilder }).effectsBuilder).toBe(effectsBuilder);
  });
});
