import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NGlySequonParserComponent } from './n-gly-sequon-parser/n-gly-sequon-parser.component';
import {FileHandlerService} from './file-handler.service';
import { HomeComponent } from './home/home.component';
import {UniprotService} from './uniprot.service';
import { UniprotParserComponent } from './uniprot-parser/uniprot-parser.component';
import {HttpClientModule} from "@angular/common/http";
import { ResultComponent } from './result/result.component';
import {NglycoService} from "./nglyco.service";
import {PublicationService} from "./publication.service";
import { PublicationComponent } from './publication/publication.component';
import { GrantComponent } from './grant/grant.component';
import {GrantService} from "./grant.service";
import { SwathLibComponent } from './swath-lib/swath-lib.component';
import {SwathLibAssetService} from "./swath-lib-asset.service";
import { SequenceSelectorComponent } from './swath-lib/sequence-selector/sequence-selector.component';

const appRoutes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'swathlib', component: SwathLibComponent},
  {path: 'nsp', component: NGlySequonParserComponent},
  {path: 'up', component: UniprotParserComponent},
  {path: 'pub', component: PublicationComponent},
  {path: 'grant', component: GrantComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    NGlySequonParserComponent,
    HomeComponent,
    UniprotParserComponent,
    ResultComponent,
    PublicationComponent,
    GrantComponent,
    SwathLibComponent,
    SequenceSelectorComponent
  ],
  imports: [
    NgbModule.forRoot(),
    RouterModule.forRoot(
      appRoutes
    ),
    FormsModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [
    FileHandlerService,
    UniprotService,
    NglycoService,
    PublicationService,
    GrantService,
    SwathLibAssetService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
