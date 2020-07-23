import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ApiConstants } from './constants/api-constants';

@Injectable()
export class AppService {

private nightMode: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
    this.nightMode = new BehaviorSubject(false) as BehaviorSubject<any>;
  }

  getCountriesData(): Observable<any> {
    return this.http.get(ApiConstants.GET_ALL_COUNTRIES);
  }

  public getMode ():Observable<boolean> {
    return this.nightMode.asObservable();
  }

  public setMode (nightMode) {
    this.nightMode.next(nightMode);
    console.log(nightMode);
  }

}
