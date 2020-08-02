import { Component, EventEmitter, Output, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
import { NgxSpinnerService } from "ngx-spinner";

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

  constructor(private cardService: CardService, private appService: AppService, private SpinnerService: NgxSpinnerService) { }

  ngOnInit() {
    this.showPage = false;
    this.SpinnerService.show();
    this.appService.getMode().subscribe((data) => {
      this.nightMode = data;
    });

    this.cardService.getCountriesData().subscribe((data: any[]) => {

      this.countryData = data;
      this.SpinnerService.hide();
      this.showPage = true;
    });
  }

  onCountryClick(country: any): void {
    this.selectedCountry.emit(country)
  }

  populateFilteredData(data: any): void {
    this.countryData = data;
  }
}
