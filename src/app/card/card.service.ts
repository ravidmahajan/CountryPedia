import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ApiConstants } from '../constants/api-constants';

@Injectable()
export class CardService {

  private countryMap = new Map();
  private nightMode: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
  }

  getCountriesData(): Observable<any> {
    const params = new HttpParams().set('fields', 'name,flags,cca2,cca3,population,region,subregion,capital');
    return this.http.get(ApiConstants.GET_ALL_COUNTRIES, { params });
  }

  public setCountryMapping(countryCode, countryName) {
    this.countryMap.set(countryCode, countryName);
  }

  public getCountryByCode(countryCode) {
    return this.countryMap.get(countryCode);
  }
}
