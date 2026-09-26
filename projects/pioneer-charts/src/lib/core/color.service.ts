import { Injectable, signal, untracked } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PcacColorService {
  private primary = '#43425d';
  private primaryLight = '#a3a1fb';
  private success = '#5ee2a0';
  private danger = '#ff6565';
  private warning = '#fec163';
  private orange = '#ffa177';
  private blue = '#55d8fe';
  private alert = 'red';

  /**
   * Bumped by every setter, and read by the getters, so anything reading colors inside a reactive
   * context tracks palette changes: the legend's `colorScale` computed recomputes, and every chart
   * (whose build runs in an `effect`) redraws - together, rather than the legend keeping the old
   * swatches while newly built charts took the new palette.
   */
  private readonly version = signal(0);

  /**
   * Bumps `version` from a setter. `untracked`, because Angular forbids writing a signal inside a
   * `computed` - and a consumer deriving its theme reactively (`computed(() => { setScale(...);
   * ... })`) called these setters there without error before they were reactive.
   */
  private changed(): void {
    untracked(() => this.version.update((v) => v + 1));
  }

  /** A consumer's own scale from `setScale()`; replaces the default palette while set. */
  private customScale: string[] | null = null;

  /**
   * The palette charts cycle through: the `setScale()` one when given, else the default colors
   * built from the current fields - so a setter like `setSuccess()` changes the charts drawn after
   * it, rather than a copy of the colors taken when the service was created.
   */
  private get scale(): string[] {
    return this.customScale ?? [
      this.primaryLight,
      this.success,
      this.danger,
      this.warning,
      this.orange,
      this.blue,
    ];
  }

  /**
   * Get a scale of colors dynamically
   * @param numberOfNodes Number of items in dynamically build collection of colors
   */
  getColorScale(numberOfNodes: number): string[] {
    this.version();
    const palette = [] as string[];
    for (let i = 0; i < numberOfNodes; i++) {
      const mark = i % this.scale.length;
      palette.push(this.scale[mark]);
    }
    return palette;
  }

  getAlert(): string {
    this.version();
    return this.alert;
  }

  /**
   * Set the scale that charts use to set colors of data[x] on the UI, in place of the default
   * palette (and of the individual color setters below, which only shape the default). An empty
   * array goes back to the default palette rather than leaving charts with no colors.
   * @param colors A collection of hex values
   */
  setScale(colors: string[]): void {
    this.customScale = colors.length ? [...colors] : null;
    this.changed();
  }

  /** @deprecated No chart reads the primary color; it isn't part of the palette. */
  setPrimary(color: string): void {
    this.primary = color;
    this.changed();
  }

  setPrimaryLight(color: string): void {
    this.primaryLight = color;
    this.changed();
  }

  setSuccess(color: string): void {
    this.success = color;
    this.changed();
  }

  setDanger(color: string): void {
    this.danger = color;
    this.changed();
  }

  setWarning(color: string): void {
    this.warning = color;
    this.changed();
  }

  setOrange(color: string): void {
    this.orange = color;
    this.changed();
  }

  setBlue(color: string): void {
    this.blue = color;
    this.changed();
  }

  setAlert(color: string): void {
    this.alert = color;
    this.changed();
  }
}
