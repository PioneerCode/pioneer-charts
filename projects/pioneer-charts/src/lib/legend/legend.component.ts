import { Component, computed, inject, model, output } from '@angular/core';
import { PcacColorService } from '../core';

export class PcacLegendConfigItem {
  label!: string;
  checked: boolean = true;
}

export class PcacLegendConfig {
  heading: string | null = null;
  items: PcacLegendConfigItem[] = [];
}

@Component({
  selector: 'pcac-legend',
  templateUrl: './legend.component.html',
  styleUrls: ['./legend.component.scss'],
})
export class PcacLegend {
  readonly colorService = inject(PcacColorService);
  config = model.required<PcacLegendConfig>();
  itemClicked = output<PcacLegendConfigItem[]>();

  colorScale = computed(() => 
    this.colorService.getColorScale(this.config().items.length)
  );

  onItemClicked(index: number) {
    const data = this.config();
    data.items[index].checked = !data.items[index].checked;
    this.config.set(data);
    this.itemClicked.emit(data.items);
  }
}
