import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Routes ,RouterModule} from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { CardComponent } from './card/card.component';
import { FilterDropdownComponent } from './utility/filter-dropdown/filter-dropdown.component';
import { SearchPipe } from './utility/pipe/search.pipe';
import { ShortNamePipe } from './utility/pipe/short-name.pipe'
import { CardsDetailComponent } from './cards-detail/cards-detail.component';
import { AppService } from "./app.service";

const appRoutes: Routes = [
  { path: '', component: AppComponent },
  { path: 'country', component: CardsDetailComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    CardComponent,
    FilterDropdownComponent,
    SearchPipe,
    ShortNamePipe,
    CardsDetailComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [AppService],
  bootstrap: [AppComponent]
})
export class AppModule { }
