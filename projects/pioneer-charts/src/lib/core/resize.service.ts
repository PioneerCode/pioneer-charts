import { DestroyRef, ElementRef, Injectable, Signal, afterNextRender, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Rebuilds a chart whenever its container's real, laid-out size changes.
 *
 * A plain `window:resize` listener (the previous approach) misses any layout-driven size change
 * that isn't a viewport resize — a sidebar collapsing, a tab becoming active, a flex/grid reflow.
 * It also can't help a chart that mounts already holding data (e.g. behind a loading gate): that
 * chart's first `ngOnChanges` can fire before the browser has committed layout for its own
 * just-created DOM node, so `PcacChart.initializeChartState()` measures a 0-width container and
 * bails out with nothing drawn — and with no resize ever firing, nothing retries it.
 *
 * `ResizeObserver`'s callback contract guarantees real, laid-out dimensions on every firing,
 * including its first, so observing the container naturally retries that exact case.
 */
@Injectable({ providedIn: 'root' })
export class PcacChartResizeService {
  /**
   * Call once from a chart component's constructor (an injection context).
   * @param chartElm Signal resolving to the chart's `<svg>` element ref, e.g. a `viewChild.required` query.
   * @param rebuild Invoked whenever the chart's container size changes: immediately for the
   * observer's first (guaranteed-initial) callback, debounced for every one after that.
   */
  observe(chartElm: Signal<ElementRef>, rebuild: () => void): void {
    const destroyRef = inject(DestroyRef);
    const trigger$ = new Subject<void>();
    trigger$.pipe(
      debounceTime(300),
      takeUntilDestroyed(destroyRef)
    ).subscribe(rebuild);

    // chartElm() is a required viewChild query: unreadable until this component's own view has
    // been created, so we defer the observe() call itself rather than reading it eagerly here.
    afterNextRender(() => {
      const container = chartElm().nativeElement.parentNode as HTMLElement;
      // The observer's first callback is its guaranteed initial one (see the class doc comment) -
      // it's correcting an already-wrong first paint (e.g. a host layout, like a Material sidenav,
      // that hasn't finished settling its width yet when this chart's very first build ran), not
      // responding to live resize churn, so it shouldn't sit behind the same 300ms debounce meant
      // for that. Left debounced, that correction could land while the wrong-width build's own
      // enter transition is still visibly mid-animation, restarting it partway through - firing it
      // immediately instead means the correction lands within a frame or two, before there's
      // anything to visibly interrupt. Every callback after the first is still debounced normally.
      let firstCallback = true;
      const observer = new ResizeObserver(() => {
        if (firstCallback) {
          firstCallback = false;
          rebuild();
          return;
        }
        trigger$.next();
      });
      observer.observe(container);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
