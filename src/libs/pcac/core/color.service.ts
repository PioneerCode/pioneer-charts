import { Injectable } from '@angular/core';

@Injectable()
export class PcacColorService {
  private primary = '#43425d';
  private primaryLight = '#a3a1fb';
  private success = '#5ee2a0';
  private danger = '#ff6565';
  private warning = '#fec163';
  private orange = '#ffa177';
  private blue = '#55d8fe';
  private scale = [
    this.primaryLight,
    this.success,
    this.danger,
    this.warning,
    this.orange,
    this.blue
  ] as string[];

  /**
   * Get a scale of colors dynamically
   * @param numberOfNodes Number of items in dynamically build collection of colors
   */
  getColorScale(numberOfNodes: number): string[] {
    const pallette = [] as string[];
    for (let i = 0; i < numberOfNodes; i++) {
      const mark = i % this.scale.length;
      pallette.push(this.scale[mark]);
    }
    return pallette;
  }

  setScale(colors: string[]): void {
    this.scale = colors;
  }

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

  setOrange(color: string): void {
    this.orange = color;
  }

  setBlue(color: string): void {
    this.blue = color;
  }
}
