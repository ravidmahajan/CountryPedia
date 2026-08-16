import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from '../app.service';
import { NormalizedCountry } from '../utility/country-adapter';

@Injectable()
export class CardService {

  private countryMap = new Map<string, string>();

  constructor(private appService: AppService) {
  }

  getCountriesData(): Observable<NormalizedCountry[]> {
    return this.appService.getCountriesData();
  }

  public setCountryMapping(countryCode: string, countryName: string) {
    if (countryCode && countryName) {
      this.countryMap.set(countryCode.toUpperCase(), countryName);
    }
  }

  public getCountryByCode(countryCode: string): string {
    if (!countryCode) {
      return '';
    }
    const code = countryCode.toUpperCase();
    return this.countryMap.get(code) || countryCode;
  }
}
