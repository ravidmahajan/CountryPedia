import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from "ngx-spinner";

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  selectedCountry: any = [];
  searchText: any;
  nightMode: boolean;
  title = 'CountryPedia';
  countryData: any;
  showPage: boolean;

  constructor(private http: HttpClient, public appService: AppService, private SpinnerService: NgxSpinnerService) {
  }

  ngOnInit(): void {
    this.showPage = false;
    this.SpinnerService.show();
    this.appService.getMode().subscribe((data) => {
      this.nightMode = data;
      this.SpinnerService.hide();
      this.showPage = true;
    });
  }

  selectedCountryData(e: any): void {
    this.selectedCountry = e;
  }
}
