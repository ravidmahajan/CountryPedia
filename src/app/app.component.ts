import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  searchText: any;
  nightMode = false;
  title = 'CountryPedia';
  countryData: any;

  constructor(private http: HttpClient, private appService: AppService) {
  }

  ngOnInit(): void {
    this.appService.getCountriesData().subscribe((data: any[]) => {
      this.countryData = data;
    });
  }

  populateFilteredData(data: any): void {
    this.countryData = data;
  }
}
