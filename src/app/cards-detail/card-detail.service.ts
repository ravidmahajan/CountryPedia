import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError, switchMap } from 'rxjs/operators';
import { ApiConstants } from '../constants/api-constants';
import { CountryAdapter, NormalizedCountry } from '../utility/country-adapter';
import { AppService } from '../app.service';

@Injectable({
  providedIn: 'root'
})
export class CardsDetailService {
  constructor(private http: HttpClient, private appService: AppService) {
  }

  getCountryInfo(country: string): Observable<NormalizedCountry[]> {
    if (!country) {
      return of([]);
    }

    const code = country.trim().toUpperCase();
    let endpoint = ApiConstants.COUNTRY_BY_ALPHA2 + code;
    if (code.length === 3) {
      endpoint = ApiConstants.COUNTRY_BY_ALPHA3 + code;
    }

    return this.http.get<any>(endpoint).pipe(
      map(response => CountryAdapter.normalizeList(response)),
      switchMap((list) => {
        if (list && list.length > 0) {
          return of(list);
        }
        return this.fallbackLookup(country);
      }),
      catchError(() => this.fallbackLookup(country))
    );
  }

  private fallbackLookup(query: string): Observable<NormalizedCountry[]> {
    const clean = query.trim().toLowerCase();
    return this.appService.getCountriesData().pipe(
      map((allCountries) => {
        const found = allCountries.find(c =>
          (c.cca2 && c.cca2.toLowerCase() === clean) ||
          (c.cca3 && c.cca3.toLowerCase() === clean) ||
          (c.name?.common && c.name.common.toLowerCase() === clean) ||
          (c.name?.official && c.name.official.toLowerCase() === clean)
        );
        return found ? [found] : [];
      }),
      catchError(() => of([]))
    );
  }

  /**
   * Retrieves a concise Wikipedia summary for the specified country.
   * Falls back to alternate official names or generated descriptive text if Wikipedia is unavailable.
   */
  getCountryDescription(country: any): Observable<string> {
    if (!country) {
      return of('');
    }

    // 1. Try title from Wikipedia link if provided by REST Countries
    let wikiTitle = '';
    if (country.links?.wikipedia) {
      const parts = country.links.wikipedia.split('/wiki/');
      if (parts.length > 1) {
        wikiTitle = decodeURIComponent(parts[1]);
      }
    }

    if (!wikiTitle) {
      wikiTitle = country.name?.common || country.names?.common || '';
    }

    if (!wikiTitle) {
      return of(this.buildFallbackDescription(country));
    }

    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;

    return this.http.get<any>(url).pipe(
      map(res => {
        if (res && res.extract) {
          return this.getConciseExtract(res.extract);
        }
        return this.buildFallbackDescription(country);
      }),
      catchError(() => {
        // Fallback: try official name if different from common
        const official = country.name?.official || country.names?.official;
        if (official && official !== wikiTitle) {
          const altUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(official)}`;
          return this.http.get<any>(altUrl).pipe(
            map(res => (res && res.extract) ? this.getConciseExtract(res.extract) : this.buildFallbackDescription(country)),
            catchError(() => of(this.buildFallbackDescription(country)))
          );
        }
        return of(this.buildFallbackDescription(country));
      })
    );
  }

  private getConciseExtract(text: string): string {
    if (!text) {
      return '';
    }
    const firstPara = text.split('\n\n')[0];
    if (firstPara.length <= 280) {
      return firstPara;
    }
    const sentences = firstPara.match(/[^.!?]+[.!?]+/g) || [firstPara];
    let result = '';
    for (const s of sentences) {
      if ((result + s).length > 280 && result.length > 0) {
        break;
      }
      result += (result ? ' ' : '') + s.trim();
    }
    return result.trim() || (firstPara.slice(0, 280) + '...');
  }

  private buildFallbackDescription(country: any): string {
    const common = country.name?.common || country.names?.common || 'This country';
    const official = country.name?.official || country.names?.official;
    const region = country.region || '';
    const subregion = country.subregion || '';
    const capital = (country.capital && country.capital.length) ? country.capital[0] : '';
    const pop = country.population ? Number(country.population).toLocaleString() : '';
    
    let desc = `${common}`;
    if (official && official !== common) {
      desc += `, officially ${official},`;
    }
    if (region) {
      desc += ` is located in ${region}${subregion ? ' (' + subregion + ')' : ''}`;
    }
    if (capital) {
      desc += ` with its capital at ${capital}.`;
    } else {
      desc += `.`;
    }
    if (pop) {
      desc += ` It has a total population of approximately ${pop}.`;
    }
    return desc;
  }
}
