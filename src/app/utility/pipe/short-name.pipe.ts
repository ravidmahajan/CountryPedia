import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortName'
})
export class ShortNamePipe implements PipeTransform {
  transform(value: any, limit: number): string {
    if (!value) {
      return '';
    }
    const str = typeof value === 'string' ? value : String(value);
    if (str.length > limit) {
      return str.substr(0, limit) + ' ...';
    }
    return str;
  }
}
