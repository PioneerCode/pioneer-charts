import { Injectable } from '@angular/core';

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
    const palette = [] as string[];
    for (let i = 0; i < numberOfNodes; i++) {
      const mark = i % this.scale.length;
      palette.push(this.scale[mark]);
    }
    return palette;
  }

  getAlert(): string {
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
  }

  /** @deprecated No chart reads the primary color; it isn't part of the palette. */
  setPrimary(color: string): void {
    this.primary = color;
  }

  setPrimaryLight(color: string): void {
    this.primaryLight = color;
  }

  setSuccess(color: string): void {
    this.success = color;
  }

  setDanger(color: string): void {
    this.danger = color;
  }

  setWarning(color: string): void {
    this.warning = color;
  }

  setOrange(color: string): void {
    this.orange = color;
  }

  setBlue(color: string): void {
    this.blue = color;
  }

  setAlert(color: string): void {
    this.alert = color;
  }
}
