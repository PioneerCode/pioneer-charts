import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PcacLegend, PcacLegendConfig, PcacLegendConfigItem } from './legend.component';
import { PcacColorService } from '../core/color.service';

@Component({
  selector: 'pcac-legend-test-host',
  imports: [PcacLegend],
  template: `<pcac-legend [(config)]="config" />`,
})
class TestHostComponent {
  readonly config = signal<PcacLegendConfig>({
    heading: 'Series',
    items: [{ label: 'A', checked: true, colorOverride: null }, { label: 'B', checked: true, colorOverride: null }],
  });
}

// Regression test: the legend's @for tracked items by identity, but toggling one replaces it
// with a spread copy - so Angular tore down and re-created the very element the keyboard user
// had just pressed Enter/Space on, dropping focus on the floor.
describe('PcacLegend', () => {
  it('keeps focus on the item toggled from the keyboard', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    const item = fixture.nativeElement.querySelectorAll('.pcac-legend-item')[1] as HTMLElement;
    item.focus();
    expect(document.activeElement).toBe(item);

    item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await fixture.whenStable();

    expect(fixture.componentInstance.config().items[1].checked).toBe(false);
    expect(item.isConnected).toBe(true);
    expect(document.activeElement).toBe(item);
    expect(item.getAttribute('aria-checked')).toBe('false');
  });
});

describe('PcacLegend swatches', () => {
  const swatches = (fixture: { nativeElement: HTMLElement }) =>
    Array.from(fixture.nativeElement.querySelectorAll<HTMLElement>('.pcac-legend-circle')).map((c) => c.style.backgroundColor);

  it('colors each item from the palette, or its own colorOverride', async () => {
    TestBed.inject(PcacColorService).setScale(['#111111', '#222222']);
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentInstance.config.update((config) => ({
      ...config,
      items: [...config.items, { label: 'C', checked: true, colorOverride: '#333333' }],
    }));
    await fixture.whenStable();

    expect(swatches(fixture)).toEqual(['rgb(17, 17, 17)', 'rgb(34, 34, 34)', 'rgb(51, 51, 51)']);
  });

  // Regression test: the swatches were a computed over `config` alone, and the palette was plain
  // fields - so `setScale()` (e.g. a theme toggle) left the legend on the old colors while charts
  // built afterwards took the new ones.
  it('follows a palette change', async () => {
    const colors = TestBed.inject(PcacColorService);
    colors.setScale(['#111111', '#222222']);
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();

    colors.setScale(['#444444', '#555555']);
    await fixture.whenStable();

    expect(swatches(fixture)).toEqual(['rgb(68, 68, 68)', 'rgb(85, 85, 85)']);
  });

  it('emits every item, with the clicked one toggled, on click', async () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    await fixture.whenStable();
    const legend = fixture.debugElement.children[0].componentInstance as PcacLegend;
    const emitted: PcacLegendConfigItem[][] = [];
    legend.itemClicked.subscribe((items) => emitted.push(items));

    (fixture.nativeElement.querySelectorAll('.pcac-legend-item')[0] as HTMLElement).click();

    expect(emitted.length).toBe(1);
    expect(emitted[0].map((item) => [item.label, item.checked])).toEqual([['A', false], ['B', true]]);
  });
});
