import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ApiConstants } from './constants/api-constants';

@Injectable()
export class AppService {

private nightMode: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
    this.nightMode = new BehaviorSubject(false) as BehaviorSubject<any>;
  }

  getCountriesData(): Observable<any> {
    const params = new HttpParams().set('fields', 'name,flags,cca2,cca3,population,region,subregion,capital,latlng');
    return this.http.get(ApiConstants.GET_ALL_COUNTRIES, { params });
  }

  public getMode ():Observable<boolean> {
    return this.nightMode.asObservable();
  }

  public setMode (nightMode) {
    this.nightMode.next(nightMode);
    console.log(nightMode);
  }

}
