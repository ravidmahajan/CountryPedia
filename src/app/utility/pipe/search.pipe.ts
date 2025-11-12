import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class SearchPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {

    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    searchText = searchText.trim().toLocaleLowerCase();

    return items.filter(it => {
      const name = it.name?.common || it.name || '';
      return name.toLocaleLowerCase().includes(searchText);
    });
  }
}