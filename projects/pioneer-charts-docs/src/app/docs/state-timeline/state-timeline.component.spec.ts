import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { statusHistory } from './state-timeline-demo';
import { StateTimelineComponent } from './state-timeline.component';

describe('StateTimelineComponent', () => {
  beforeAll(() => {
    // jsdom has no ResizeObserver, which every chart uses, nor layout: each chart gets a width to draw in
    vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: false, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
    }));
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return 600; } });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
    delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
  });

  it('draws each of its examples', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(StateTimelineComponent);
    await fixture.whenStable();
    const charts = Array.from(fixture.nativeElement.querySelectorAll('pcac-state-timeline') as NodeListOf<HTMLElement>);
    expect(charts.length).toBeGreaterThanOrEqual(3);
    for (const chart of charts) {
      expect(chart.querySelectorAll('.pcac-state-period').length, chart.outerHTML.slice(0, 80)).toBeGreaterThan(0);
    }
  });

  it('tells the same story on every build, so the pre-rendered page matches what the browser draws', () => {
    expect(statusHistory()).toEqual(statusHistory());
  });

  it('has the four services the page tells of, a month of days each', () => {
    const rows = statusHistory().data;
    expect(rows.map((row) => row.key)).toEqual(['API', 'Database', 'Uploads', 'Backups']);
    expect(rows.every((row) => row.data.length === 30)).toBe(true);
  });

  it('has an OK day, a Warning, an Error and a day not all of which is known in its status history', () => {
    const periods = statusHistory().data.flatMap((row) => row.data);
    const times = (key: string) => periods.filter((p) => p.data.some((s) => s.key === key && Number(s.value) > 0)).length;
    expect(times('warning')).toBeGreaterThan(0);
    expect(times('error')).toBeGreaterThan(0);
    expect(periods.some((p) => p.data.every((s) => s.key === 'ok'))).toBe(true);
    expect(periods.some((p) => p.data.reduce((sum, s) => sum + Number(s.value), 0) < Number(p.value))).toBe(true);
  });
});
