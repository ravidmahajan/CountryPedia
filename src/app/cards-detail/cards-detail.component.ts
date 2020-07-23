import { Component, OnInit, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Location } from '@angular/common';
import { CardsDetailService } from '../cards-detail/card-detail.service';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';

@Component({
  selector: 'app-cards-detail',
  templateUrl: './cards-detail.component.html',
  styleUrls: ['./cards-detail.component.css']
})
export class CardsDetailComponent implements OnInit, OnDestroy {

  countryCode: string;
  paramsSubscription: Subscription;
  selectedCountry: any = [];

  nightMode;

  constructor(private router: Router, private route: ActivatedRoute, private location: Location,
    private cardsDetailService: CardsDetailService, private appService:AppService) { }

  ngOnInit(): void {

    
    this.appService.getMode().subscribe((data)=> {
      this.nightMode = data;
    });

    this.paramsSubscription = this.route.params.subscribe(
      (params: Params) => {
        this.countryCode = params['country'];
      });
    this.cardsDetailService.getCountryInfo(this.countryCode).subscribe((data) => {
      this.selectedCountry = data;
      // this.router.navigate(['alpha', data.alpha2Code.toLowerCase()]);
    });
  }

  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.paramsSubscription.unsubscribe();
  }




}
