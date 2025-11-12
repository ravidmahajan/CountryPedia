import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiConstants } from '../constants/api-constants';

@Injectable({
    providedIn: 'root'
})
export class CardsDetailService {
  constructor(private http: HttpClient) {
  }

  getCountryInfo(country: string): Observable<any> {
    // For detail page, we need all fields, so don't specify fields parameter to get everything
    return this.http.get(ApiConstants.COUNTRY_DATA + country);
  }
}
