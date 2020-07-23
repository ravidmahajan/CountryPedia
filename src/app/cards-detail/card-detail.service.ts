import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiConstants } from '../constants/api-constants';

@Injectable({
    providedIn: 'root'
})
export class CardsDetailService {
  constructor(private http: HttpClient) {
  }

  getCountryInfo(country: string): Observable<any> {
    return this.http.get(ApiConstants.COUNTRY_DATA + country);
  }
}
