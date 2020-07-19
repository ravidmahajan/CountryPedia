import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'
import {Routes} from '@angular/router';

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { CommonModule } from '@angular/common';
import { FilterDropdownComponent } from './utility/filter-dropdown/filter-dropdown.component';
import { SearchPipe } from './utility/pipe/search.pipe';
import { ShortNamePipe } from './utility/pipe/short-name.pipe'
import { FormsModule } from '@angular/forms';
import { DropdownDirective } from './utility/directive/dropdown.directive';
import { CardsDetailComponent } from './card/cards-detail/cards-detail.component';

const appRoutes : Routes = [
  {path: '' , component: AppComponent},
  {path: '/country' , component: CardsDetailComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    FilterDropdownComponent,
    SearchPipe,
    ShortNamePipe,
    DropdownDirective,
    CardsDetailComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
