import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ApiConstants } from '../../constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class FilterDropdownService {
  constructor(private http: HttpClient) {
  }

  getCountriesByRegion(region): Observable<any> {
    const params = new HttpParams().set('fields', 'name,flags,cca2,cca3,population,region,subregion,capital');
    return this.http.get(ApiConstants.COUNTRIES_BY_REGION + region, { params });
  }
}
