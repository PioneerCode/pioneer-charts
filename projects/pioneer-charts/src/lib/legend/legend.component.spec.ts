import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PcacLegend, PcacLegendConfig } from './legend.component';

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
