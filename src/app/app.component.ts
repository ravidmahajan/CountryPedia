import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  selectedCountry: any = [];
  searchText: any;
  nightMode;
  title = 'CountryPedia';
  countryData: any;

  constructor(private http: HttpClient, private appService: AppService) {
  }

  ngOnInit(): void {
    
    this.appService.getMode().subscribe((data)=> {
      this.nightMode = data;
    });
  }
  
  selectedCountryData(e: any): void {
    this.selectedCountry = e;
  }

}
