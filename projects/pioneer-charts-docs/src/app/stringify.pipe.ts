import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringify',
  standalone: true
})
export class StringifyPipe implements PipeTransform {
  transform(val: any) {
    return JSON.stringify(val, null, 2);
  }
}