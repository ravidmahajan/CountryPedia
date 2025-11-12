import { Component, OnInit, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { AppService } from '../app.service';
import { CardsDetailService } from '../cards-detail/card-detail.service';
import { CardService } from '../card/card.service';

@Component({
  selector: 'app-cards-detail',
  templateUrl: './cards-detail.component.html',
  styleUrls: ['./cards-detail.component.css']
})
export class CardsDetailComponent implements OnInit, OnDestroy {

  countryData: any;
  countryCode: string;
  paramsSubscription: Subscription;
  selectedCountry: any = {};
  showPage: boolean;
  nightMode: boolean;

  constructor(private router: Router, private route: ActivatedRoute, private location: Location,
    private cardsDetailService: CardsDetailService, private appService: AppService, private SpinnerService: NgxSpinnerService,
    private cardService: CardService) { }

  ngOnInit(): void {
    this.showPage = false;
    this.SpinnerService.show();
    this.appService.getMode().subscribe((data) => {
      this.nightMode = data;
    });

    this.paramsSubscription = this.route.params.subscribe(
      (params: Params) => {
        this.countryCode = params['country'];
      });

    this.cardsDetailService.getCountryInfo(this.countryCode).subscribe((data) => {
      setTimeout(() => {
        const country = Array.isArray(data) ? data[0] : data;
        this.selectedCountry = country || {};
        this.SpinnerService.hide();
        this.showPage = true;
      });
    });
  }

  goBack(): void {
    this.location.back();
  }

  getNativeName(): string {
    if (!this.selectedCountry.name?.nativeName) {
      return this.selectedCountry.name?.common || '';
    }
    const nativeNames = this.selectedCountry.name.nativeName;
    const firstKey = Object.keys(nativeNames)[0];
    return nativeNames[firstKey]?.common || this.selectedCountry.name.common || '';
  }

  getCapital(): string {
    if (!this.selectedCountry.capital || this.selectedCountry.capital.length === 0) {
      return 'N/A';
    }
    return this.selectedCountry.capital[0];
  }

  getTopLevelDomain(): string {
    if (!this.selectedCountry.tld || this.selectedCountry.tld.length === 0) {
      return 'N/A';
    }
    return this.selectedCountry.tld.join(', ');
  }

  getCurrencies(): string[] {
    if (!this.selectedCountry.currencies) {
      return [];
    }
    return Object.values(this.selectedCountry.currencies).map((currency: any) => currency.name);
  }

  getLanguages(): string[] {
    if (!this.selectedCountry.languages) {
      return [];
    }
    return Object.values(this.selectedCountry.languages);
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
  }
}
