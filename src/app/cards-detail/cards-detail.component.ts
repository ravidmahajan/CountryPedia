import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

import { AppService } from '../app.service';
import { CardsDetailService } from '../cards-detail/card-detail.service';
import { CardService } from '../card/card.service';
import { NormalizedCountry } from '../utility/country-adapter';

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
  countryDescription: string = '';
  showPage: boolean = false;
  nightMode: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private cardsDetailService: CardsDetailService,
    private appService: AppService,
    private SpinnerService: NgxSpinnerService,
    public cardService: CardService
  ) { }

  ngOnInit(): void {
    this.showPage = false;
    this.SpinnerService.show();
    this.appService.getMode().subscribe((data) => {
      this.nightMode = data;
    });

    this.cardService.getCountriesData().subscribe((countries) => {
      if (Array.isArray(countries)) {
        countries.forEach((item) => {
          if (item.cca3 && item.name?.common) {
            this.cardService.setCountryMapping(item.cca3, item.name.common);
          }
          if (item.cca2 && item.name?.common) {
            this.cardService.setCountryMapping(item.cca2, item.name.common);
          }
        });
      }
    });

    this.paramsSubscription = this.route.params.subscribe((params: Params) => {
      this.countryCode = params['country'];
      this.loadCountryDetail(this.countryCode);
    });
  }

  private loadCountryDetail(code: string): void {
    this.SpinnerService.show();
    this.countryDescription = '';
    this.cardsDetailService.getCountryInfo(code).subscribe((data: NormalizedCountry[]) => {
      const country = Array.isArray(data) && data.length > 0 ? data[0] : (data || {});
      this.selectedCountry = country;

      // Fetch country summary from Wikipedia
      this.cardsDetailService.getCountryDescription(country).subscribe((desc: string) => {
        this.countryDescription = desc;
      });

      this.SpinnerService.hide();
      this.showPage = true;
    }, (error) => {
      console.error('Error loading country detail:', error);
      this.SpinnerService.hide();
      this.showPage = true;
    });
  }

  goBack(): void {
    this.location.back();
  }

  onFlagError(event: any): void {
    if (event && event.target) {
      const code = this.selectedCountry?.cca2 || this.selectedCountry?.cca3 || this.selectedCountry?.name?.common?.slice(0, 2) || '??';
      const name = this.selectedCountry?.name?.common || 'Country';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#34495e"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#ecf0f1" font-family="Arial,sans-serif" font-size="52" font-weight="bold">${code}</text><text x="50%" y="68%" dominant-baseline="middle" text-anchor="middle" fill="#bdc3c7" font-family="Arial,sans-serif" font-size="24">${name}</text></svg>`;
      event.target.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
  }

  getNativeName(): string {
    if (!this.selectedCountry.name?.nativeName) {
      return this.selectedCountry.name?.common || this.selectedCountry.names?.common || '';
    }
    const nativeNames = this.selectedCountry.name.nativeName;
    const keys = Object.keys(nativeNames);
    if (keys.length === 0) {
      return this.selectedCountry.name?.common || '';
    }
    const firstKey = keys[0];
    const val = nativeNames[firstKey];
    if (typeof val === 'string') {
      return val;
    }
    return val?.common || val?.official || this.selectedCountry.name?.common || '';
  }

  getCapital(): string {
    if (!this.selectedCountry.capital || this.selectedCountry.capital.length === 0) {
      return 'N/A';
    }
    const cap = this.selectedCountry.capital[0];
    return typeof cap === 'string' ? cap : (cap?.name || 'N/A');
  }

  getTopLevelDomain(): string {
    const tlds = this.selectedCountry.tld || this.selectedCountry.tlds;
    if (!tlds || tlds.length === 0) {
      return 'N/A';
    }
    return Array.isArray(tlds) ? tlds.join(', ') : tlds;
  }

  getCurrencies(): string[] {
    if (!this.selectedCountry.currencies) {
      return [];
    }
    if (Array.isArray(this.selectedCountry.currencies)) {
      return this.selectedCountry.currencies.map((c: any) => c.name || c.code).filter(Boolean);
    }
    return Object.values(this.selectedCountry.currencies).map((currency: any) => {
      return typeof currency === 'string' ? currency : (currency?.name || currency?.symbol || '');
    }).filter(Boolean);
  }

  getLanguages(): string[] {
    if (!this.selectedCountry.languages) {
      return [];
    }
    if (Array.isArray(this.selectedCountry.languages)) {
      return this.selectedCountry.languages.map((l: any) => typeof l === 'string' ? l : (l.name || l.native_name)).filter(Boolean);
    }
    return Object.values(this.selectedCountry.languages).map((l: any) => typeof l === 'string' ? l : (l?.name || '')).filter(Boolean);
  }

  ngOnDestroy(): void {
    if (this.paramsSubscription) {
      this.paramsSubscription.unsubscribe();
    }
  }
}
