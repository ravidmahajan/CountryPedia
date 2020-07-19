import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ApiConstants } from '../../constants/api-constants';

@Injectable({
  providedIn: 'root'
})
export class FilterDropdownService {
  constructor(private http: HttpClient) {
  }

  getCountriesByRegion(region): Observable<any> {
    return this.http.get(ApiConstants.COUNTRIES_BY_REGION + region);
  }
}
