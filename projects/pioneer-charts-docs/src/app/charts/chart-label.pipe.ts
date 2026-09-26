import { Pipe, PipeTransform } from '@angular/core';

/**
 * Names a gallery chart for screen readers: a copy of `config` with `ariaLabel` set. Pure, so the
 * copy is made once per config and label - a fresh object on every change detection would make the
 * chart rebuild each time. Without it every gallery chart was announced as just its type ("Bar
 * chart", "Pie chart", ...), so they couldn't be told apart.
 */
@Pipe({ name: 'chartLabel' })
export class ChartLabelPipe implements PipeTransform {
  transform<T extends object>(config: T, label: string): T {
    return { ...config, ariaLabel: label };
  }
}
