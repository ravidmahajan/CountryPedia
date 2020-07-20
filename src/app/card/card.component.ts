import { Component,EventEmitter, Output, OnInit, Input, SimpleChanges, OnChanges } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  countryDetail: boolean= false;

  @Input() searchText: string;
  @Input() nightMode: boolean;
  @Input() countryData: any;
  @Output() selectedCountry = new EventEmitter();

  constructor() { }

  onCountryClick(country: any): void {
    this.selectedCountry.emit(country)

  }
}
