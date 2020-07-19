import {Component, OnInit, Input, SimpleChanges, OnChanges} from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  countryDataFilter: any = [];

  @Input() searchText: string;
  @Input() nightMode: boolean;
  @Input() countryData: any;

  constructor(private http: HttpClient) { }
}
