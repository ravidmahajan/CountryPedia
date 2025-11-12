import { Component, EventEmitter, Output, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";
import { tap } from "rxjs/operators";

import { AppService } from '../app.service';
import { CardService } from './card.service'

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent implements OnInit {
  countryDetail: boolean = false;
  countryData: any = []
  searchText: string;
  nightMode: boolean;
  showPage: boolean;

  @Output() selectedCountry = new EventEmitter();

  constructor(private cardService: CardService, private appService: AppService, private SpinnerService: NgxSpinnerService) {
  }

  ngOnInit() {
    this.showPage = false;
    this.SpinnerService.show();
    this.appService.getMode().subscribe((data) => {
      this.nightMode = data;
    });

    this.cardService.getCountriesData().pipe(tap((data: any[]) => {
      data.forEach((item) => {
        this.cardService.setCountryMapping(item.cca3, item.name.common);
      });
    })).subscribe((data: any[]) => {
      this.countryData = this.sortCountries(data);
      this.SpinnerService.hide();
      this.showPage = true;
    });
  }

  onCountryClick(country: any): void {
    this.selectedCountry.emit(country)
  }

  populateFilteredData(data: any): void {
    this.countryData = this.sortCountries(data);
  }

  private sortCountries(data: any[]): any[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return [...data].sort((a, b) => {
      const nameA = a?.name?.common || a?.name || '';
      const nameB = b?.name?.common || b?.name || '';
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  }
}
