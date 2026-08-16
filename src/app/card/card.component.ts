import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { tap } from "rxjs/operators";

import { AppService } from '../app.service';
import { CardService } from './card.service';
import { NormalizedCountry } from '../utility/country-adapter';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  countryDetail: boolean = false;
  countryData: NormalizedCountry[] = [];
  searchText: string = '';
  nightMode: boolean = false;
  showPage: boolean = false;

  @Output() selectedCountry = new EventEmitter();

  constructor(private cardService: CardService, private appService: AppService, private SpinnerService: NgxSpinnerService) {
  }

  ngOnInit() {
    this.showPage = false;
    this.SpinnerService.show();
    this.appService.getMode().subscribe((data) => {
      this.nightMode = data;
    });

    this.cardService.getCountriesData().pipe(tap((data: NormalizedCountry[]) => {
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (item.cca3 && item.name?.common) {
            this.cardService.setCountryMapping(item.cca3, item.name.common);
          }
          if (item.cca2 && item.name?.common) {
            this.cardService.setCountryMapping(item.cca2, item.name.common);
          }
        });
      }
    })).subscribe((data: NormalizedCountry[]) => {
      this.countryData = this.sortCountries(data);
      this.SpinnerService.hide();
      this.showPage = true;
    }, (error) => {
      console.error('Error fetching countries:', error);
      this.SpinnerService.hide();
      this.showPage = true;
    });
  }

  onCountryClick(country: any): void {
    this.selectedCountry.emit(country);
  }

  populateFilteredData(data: any): void {
    this.countryData = this.sortCountries(data);
  }

  onFlagError(event: any, country: NormalizedCountry): void {
    if (event && event.target) {
      const code = country?.cca2 || country?.cca3 || country?.name?.common?.slice(0, 2) || '??';
      const name = country?.name?.common || 'Country';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200"><rect width="320" height="200" fill="#34495e"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#ecf0f1" font-family="Arial,sans-serif" font-size="28" font-weight="bold">${code}</text><text x="50%" y="70%" dominant-baseline="middle" text-anchor="middle" fill="#bdc3c7" font-family="Arial,sans-serif" font-size="14">${name}</text></svg>`;
      event.target.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
  }

  private sortCountries(data: NormalizedCountry[]): NormalizedCountry[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return [...data].sort((a, b) => {
      const nameA: string = typeof a?.name === 'string' ? a.name : (a?.name?.common || '');
      const nameB: string = typeof b?.name === 'string' ? b.name : (b?.name?.common || '');
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  }
}
