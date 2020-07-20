import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-cards-detail',
  templateUrl: './cards-detail.component.html',
  styleUrls: ['./cards-detail.component.css']
})
export class CardsDetailComponent implements OnInit {

  @Input() selectedCountry: any = [];
  @Input() nightMode: boolean;

  constructor() { }

  ngOnInit(): void {
  }

}
