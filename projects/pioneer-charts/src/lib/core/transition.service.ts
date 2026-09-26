import { DOCUMENT, Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PcacTransitionService {
  private transitionDuration = 750;
  private document = inject(DOCUMENT);

  /**
   * How long the charts animate - bars growing, lines drawing in, hover fades - or 0 when the user
   * has asked their system to reduce motion, so every chart is drawn in its final state at once.
   * Read on every call rather than once, so changing the setting applies from the next draw on.
   */
  getTransitionDuration(): number {
    return this.prefersReducedMotion() ? 0 : this.transitionDuration;
  }

  /** `false` where there's no `matchMedia` to ask - server-side rendering, a test environment. */
  private prefersReducedMotion(): boolean {
    return this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }
}
