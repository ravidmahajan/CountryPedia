import { Component, OnInit, Output, Input } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FilterDropdownService } from './filter-dropdown.service';
import { ApiConstants } from '../../constants/api-constants';
import { AppService } from 'src/app/app.service';

@Component({
  selector: 'app-filter-dropdown',
  templateUrl: './filter-dropdown.component.html',
  styleUrls: ['./filter-dropdown.component.css']
})
export class FilterDropdownComponent implements OnInit {

  selectedRegionType: any;
  defaultRegionType: any;
  countryData: any;
  regions: any = [
    { id: '0', name: 'All' },
    { id: '0', name: 'Africa' },
    { id: '0', name: 'Americas' },
    { id: '0', name: 'Asia' },
    { id: '0', name: 'Europe' },
    { id: '0', name: 'Oceania' }];

  @Input() nightMode: boolean;
  @Output() filteredCountries = new EventEmitter();

  constructor(private filterDropdownService: FilterDropdownService, private http: HttpClient,
    private appService: AppService) { }

  ngOnInit(): void {
    this.selectedRegionType = this.regions[0];
    this.defaultRegionType = this.regions[0];
  }

  getCountriesByRegion(e): void {
    const region = e.target.value;
    if (region == 'All') {
      this.appService.getCountriesData().subscribe((data: any[]) => {
        this.countryData = data;
      });
    } else {
      this.filterDropdownService.getCountriesByRegion(region).subscribe((data) => {
        this.filteredCountries.emit(data);
      });
    }

  }
}
