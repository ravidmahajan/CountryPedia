import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { ApiConstants } from '../../constants/api-constants';
import { CountryAdapter, NormalizedCountry } from '../country-adapter';

@Injectable({
  providedIn: 'root'
})
export class FilterDropdownService {
  constructor(private http: HttpClient) {
  }

  getCountriesByRegion(region: string): Observable<NormalizedCountry[]> {
    const params = new HttpParams().set('limit', '100');
    return this.http.get<any>(ApiConstants.COUNTRIES_BY_REGION + region, { params }).pipe(
      map(response => CountryAdapter.normalizeList(response))
    );
  }
}
