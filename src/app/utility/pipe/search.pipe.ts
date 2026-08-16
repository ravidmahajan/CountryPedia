import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class SearchPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {

    if (!items || !Array.isArray(items)) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.trim().toLocaleLowerCase();

    return items.filter(it => {
      const name = typeof it.name === 'string' ? it.name : (it.name?.common || it.names?.common || '');
      return name.toLocaleLowerCase().includes(searchText);
    });
  }
}