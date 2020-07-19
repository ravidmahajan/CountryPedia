import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ApiConstants} from './constants/api-constants';

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

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    this.http.get(ApiConstants.GET_ALL_COUNTRIES).subscribe((data: any[]) => {
      this.countryData = data;
    });
  }

  populateFilteredData(data): void {
    this.countryData = data;
  }
}
