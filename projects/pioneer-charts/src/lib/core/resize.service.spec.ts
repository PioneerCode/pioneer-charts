import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PcacChartResizeService } from './resize.service';

/**
 * jsdom doesn't implement `ResizeObserver`, so every test here stubs the global with this fake:
 * records what it was asked to observe, and lets a test fire its callback on demand to simulate
 * a real layout change (including the guaranteed-initial callback real `ResizeObserver`s make).
 */
class FakeResizeObserver {
  static instances: FakeResizeObserver[] = [];
  observedElements: Element[] = [];
  disconnected = false;

  constructor(private readonly callback: ResizeObserverCallback) {
    FakeResizeObserver.instances.push(this);
  }

  observe(el: Element): void {
    this.observedElements.push(el);
  }

  unobserve(): void { /* unused by PcacChartResizeService */ }

  disconnect(): void {
    this.disconnected = true;
  }

  trigger(): void {
    this.callback([] as unknown as ResizeObserverEntry[], this as unknown as ResizeObserver);
  }
}

@Component({
  selector: 'pcac-resize-service-test-host',
  template: `<div><svg #chart></svg></div>`,
})
class TestHostComponent {
  readonly chartElm = viewChild.required<ElementRef>('chart');
  rebuildCalls = 0;

  constructor() {
    inject(PcacChartResizeService).observe(this.chartElm, () => this.rebuildCalls++);
  }
}

describe('PcacChartResizeService', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    FakeResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    vi.useFakeTimers();

    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable(); // flush afterNextRender
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('observes the chart element\'s parent container', () => {
    expect(FakeResizeObserver.instances.length).toBe(1);
    expect(FakeResizeObserver.instances[0].observedElements).toEqual([host.chartElm().nativeElement.parentNode]);
  });

  it('does not call rebuild before the observer ever fires', () => {
    expect(host.rebuildCalls).toBe(0);
  });

  it('rebuilds immediately on the observer\'s first (guaranteed-initial) callback', () => {
    FakeResizeObserver.instances[0].trigger();

    expect(host.rebuildCalls).toBe(1); // no debounce for the first callback
  });

  it('debounces a callback after the first into one rebuild, 300ms after it fires', () => {
    const observer = FakeResizeObserver.instances[0];
    observer.trigger(); // first: immediate, consumes the "first callback" case
    expect(host.rebuildCalls).toBe(1);

    observer.trigger(); // second: debounced like any live resize
    expect(host.rebuildCalls).toBe(1);
    vi.advanceTimersByTime(299);
    expect(host.rebuildCalls).toBe(1);
    vi.advanceTimersByTime(1);
    expect(host.rebuildCalls).toBe(2);
  });

  it('debounces several rapid callbacks after the first (e.g. a drag-resize) into exactly one more rebuild', () => {
    const observer = FakeResizeObserver.instances[0];
    observer.trigger(); // first: immediate
    expect(host.rebuildCalls).toBe(1);

    observer.trigger();
    vi.advanceTimersByTime(100);
    observer.trigger();
    vi.advanceTimersByTime(100);
    observer.trigger();

    vi.advanceTimersByTime(300);
    expect(host.rebuildCalls).toBe(2); // one immediate (first) + one debounced (the burst)
  });

  it('rebuilds again on a later, separate resize', () => {
    const observer = FakeResizeObserver.instances[0];
    observer.trigger(); // first: immediate
    expect(host.rebuildCalls).toBe(1);

    observer.trigger(); // second: debounced
    vi.advanceTimersByTime(300);
    expect(host.rebuildCalls).toBe(2);
  });

  it('disconnects the observer when the component is destroyed', () => {
    const observer = FakeResizeObserver.instances[0];
    fixture.destroy();
    expect(observer.disconnected).toBe(true);
  });

  it('does not call rebuild for a debounced callback that fires after destroy', () => {
    const observer = FakeResizeObserver.instances[0];
    observer.trigger(); // first: immediate, consumes the "first callback" case
    expect(host.rebuildCalls).toBe(1);

    observer.trigger(); // second: debounced, still pending when destroyed below
    fixture.destroy();
    vi.advanceTimersByTime(300);
    expect(host.rebuildCalls).toBe(1); // the pending debounced rebuild never fires
  });
});
