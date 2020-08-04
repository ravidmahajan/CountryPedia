import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ApiConstants } from '../constants/api-constants';

@Injectable()
export class CardService {

  private countryMap = new Map();
  private nightMode: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
  }

  getCountriesData(): Observable<any> {
    return this.http.get(ApiConstants.GET_ALL_COUNTRIES);
  }

  public setCountryMapping(countryCode, countryName) {
    this.countryMap.set(countryCode, countryName);
  }

  public getCountryByCode(countryCode) {
    return this.countryMap.get(countryCode);
  }
}
