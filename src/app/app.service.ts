import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';

import { ApiConstants } from './constants/api-constants';
import { CountryAdapter, NormalizedCountry } from './utility/country-adapter';

@Injectable()
export class AppService {

  private nightMode: BehaviorSubject<boolean>;
  private countriesCache$: Observable<NormalizedCountry[]> | null = null;

  constructor(private http: HttpClient) {
    this.nightMode = new BehaviorSubject(false) as BehaviorSubject<any>;
  }

  getCountriesData(): Observable<NormalizedCountry[]> {
    if (this.countriesCache$) {
      return this.countriesCache$;
    }

    // REST Countries v5 free plan has limit=100 per request.
    // Total count is 254, so we fetch pages with offset 0, 100, 200 in parallel.
    const page1$ = this.http.get<any>(ApiConstants.GET_ALL_COUNTRIES, {
      params: new HttpParams().set('limit', '100').set('offset', '0')
    });
    const page2$ = this.http.get<any>(ApiConstants.GET_ALL_COUNTRIES, {
      params: new HttpParams().set('limit', '100').set('offset', '100')
    });
    const page3$ = this.http.get<any>(ApiConstants.GET_ALL_COUNTRIES, {
      params: new HttpParams().set('limit', '100').set('offset', '200')
    });

    this.countriesCache$ = forkJoin([page1$, page2$, page3$]).pipe(
      map(([res1, res2, res3]) => {
        const list1 = CountryAdapter.normalizeList(res1);
        const list2 = CountryAdapter.normalizeList(res2);
        const list3 = CountryAdapter.normalizeList(res3);
        return [...list1, ...list2, ...list3];
      }),
      shareReplay(1)
    );

    return this.countriesCache$;
  }

  public getMode ():Observable<boolean> {
    return this.nightMode.asObservable();
  }

  public setMode (nightMode) {
    this.nightMode.next(nightMode);
    console.log(nightMode);
  }

}
