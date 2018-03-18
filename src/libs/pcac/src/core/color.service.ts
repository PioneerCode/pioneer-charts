import { Injectable } from '@angular/core';

@Injectable()
export class PcacColorService {
  private primary: 'a3a1fb';
  private success: '5ee2a0';
  private danger: 'ff6565';
  private warning: 'fec163';
  private orange: 'ffa177';
  private blue: '55d8fe';
  private scale = [
    this.primary,
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
}
