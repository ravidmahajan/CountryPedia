import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Routes ,RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from "ngx-spinner";  

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { FilterDropdownComponent } from './utility/filter-dropdown/filter-dropdown.component';
import { SearchPipe } from './utility/pipe/search.pipe';
import { ShortNamePipe } from './utility/pipe/short-name.pipe'
import { CardsDetailComponent } from './cards-detail/cards-detail.component';
import { MapComponent } from './map/map.component';
import { AppService } from "./app.service";
import { CardService } from './card/card.service';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 

const appRoutes: Routes = [
  { path: '', component: CardComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },
  { path: 'alpha/:country', component: CardsDetailComponent },
  { path: 'map', component: MapComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    FilterDropdownComponent,
    SearchPipe,
    ShortNamePipe,
    CardsDetailComponent,
    MapComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    NgxSpinnerModule,
    RouterModule.forRoot(appRoutes),
    BrowserAnimationsModule
  ],
  providers: [AppService, CardService],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
