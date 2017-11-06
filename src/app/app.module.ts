import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import {FormsModule} from "@angular/forms";
import { RouterModule, Routes } from '@angular/router';

import { NGlySequonParserComponent } from './n-gly-sequon-parser/n-gly-sequon-parser.component';
import {FileHandlerService} from "./file-handler.service";
import { HomeComponent } from './home/home.component';

const appRoutes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'nsp', component: NGlySequonParserComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    NGlySequonParserComponent,
    HomeComponent
  ],
  imports: [
    NgbModule.forRoot(),
    RouterModule.forRoot(
      appRoutes
    ),
    FormsModule,
    BrowserModule
  ],
  providers: [
    FileHandlerService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
