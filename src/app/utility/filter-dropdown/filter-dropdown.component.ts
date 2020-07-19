import { Component, OnInit, Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import {Observable} from 'rxjs';
import {FilterDropdownService} from './filter-dropdown.service';
import {ApiConstants} from '../../constants/api-constants';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-filter-dropdown',
  templateUrl: './filter-dropdown.component.html',
  styleUrls: ['./filter-dropdown.component.css']
})
export class FilterDropdownComponent implements OnInit {

  selectedRegionType: any;
  defaultRegionType: any;
  countryData: any;
  @Output() filteredCountries = new EventEmitter();

  regions: any = [
    {id: '0', name: 'All'},
    {id: '0', name: 'Africa'},
    {id: '0', name: 'Americas'},
    {id: '0', name: 'Asia'},
    {id: '0', name: 'Europe'},
    {id: '0', name: 'Oceania'}];

  constructor(private filterDropdownService: FilterDropdownService, private http: HttpClient) { }


  ngOnInit(): void {
    this.selectedRegionType = this.regions[0];
    this.defaultRegionType  = this.regions[0];
  }

  getCountriesByRegion(e): void {
    const region = e.target.value;
    if (region == 'All'){
      this.http.get(ApiConstants.GET_ALL_COUNTRIES).subscribe((data: any[]) => {
        this.countryData = data.sort();
      });
    }else {
      this.filterDropdownService.getCountriesByRegion(region).subscribe((data) => {
        this.filteredCountries.emit(data);
      });
    }

  }
}
