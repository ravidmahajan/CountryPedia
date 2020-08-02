import { Component, EventEmitter, Output, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';
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

  nightMode;
  @Output() selectedCountry = new EventEmitter();

  constructor(private cardService: CardService, private appService: AppService) { }
  ngOnInit() {
    this.cardService.getCountriesData().subscribe((data: any[]) => {
      this.countryData = data;
    });

    this.appService.getMode().subscribe((data) => {
      this.nightMode = data;
    });
  }

  onCountryClick(country: any): void {
    this.selectedCountry.emit(country)
  }

  populateFilteredData(data: any): void {
    this.countryData = data;
  }
}
