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
  selectedCountry: any = [];
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
        this.selectedCountry = data;
        this.SpinnerService.hide();
        this.showPage = true;
      })

    });
  }

  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
  }
}
