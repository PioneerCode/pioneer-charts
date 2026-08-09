import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringify'
})
export class StringifyPipe implements PipeTransform {
  transform(val: unknown) {
    return JSON.stringify(val, null, 2);
  }
}