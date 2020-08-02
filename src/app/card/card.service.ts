import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ApiConstants } from '../constants/api-constants';

@Injectable()
export class CardService {

private nightMode: BehaviorSubject<boolean>;

  constructor(private http: HttpClient) {
  }

  getCountriesData(): Observable<any> {
    return this.http.get(ApiConstants.GET_ALL_COUNTRIES);
  }
}
