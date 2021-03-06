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
import {HttpClientModule} from '@angular/common/http';
import { ResultComponent } from './result/result.component';
import {NglycoService} from './nglyco.service';
import {PublicationService} from './publication.service';
import { PublicationComponent } from './publication/publication.component';
import { GrantComponent } from './grant/grant.component';
import {GrantService} from './grant.service';
import { SwathLibComponent } from './swath-lib/swath-lib.component';
import {SwathLibAssetService} from './swath-lib-asset.service';
import { SequenceSelectorComponent } from './swath-lib/sequence-selector/sequence-selector.component';
import {SwathResultService} from './helper/swath-result.service';
import { UserSettingsComponent } from './swath-lib/user-settings/user-settings.component';
import { GlycanPositionProfilerComponent } from './glycan-position-profiler/glycan-position-profiler.component';
import { GlycanPositionExpComponent } from './glycan-position-profiler/glycan-position-exp/glycan-position-exp.component';
import {AnnoucementService} from './helper/annoucement.service';
import { SwathLibHelpComponent } from './swath-lib/swath-lib-help/swath-lib-help.component';
import { SubcellularLocationComponent } from './subcellular-location/subcellular-location.component';
import {D3Service} from 'd3-ng2-service';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { PieChartComponent } from './pie-chart/pie-chart.component';
import { SeqViewerComponent } from './swath-lib/seq-viewer/seq-viewer.component';
import {SvgAnnotationService} from './helper/svg-annotation.service';
import {SvgContextMenuService} from './helper/svg-context-menu.service';
import {SwathLibHelperService} from './helper/swath-lib-helper.service';
import {ConnectorService} from './helper/connector.service';
import { ConnectorComponent } from './connector/connector.component';
import {GraphService} from './helper/graph.service';
import { SequenceHeatmapComponent } from './sequence-heatmap/sequence-heatmap.component';
import { SequenceVisualizerComponent } from './sequence-visualizer/sequence-visualizer.component';
import { FileSelectorComponent } from './file-selector/file-selector.component';
import {ExampleService} from './helper/example.service';
import {OverlayModule} from '@angular/cdk/overlay';
import { ContextMenuComponent } from './context-menu/context-menu.component';
import {OverlayService} from './overlay.service';

const appRoutes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'swathlib', component: SwathLibComponent},
  {path: 'nsp', component: NGlySequonParserComponent},
  {path: 'gpp', component: GlycanPositionProfilerComponent},
  {path: 'up', component: UniprotParserComponent},
  {path: 'pub', component: PublicationComponent},
  {path: 'grant', component: GrantComponent},
  {path: 'subcell', component: SubcellularLocationComponent},
  {path: 'seqvis', component: SequenceVisualizerComponent}
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
    SequenceSelectorComponent,
    UserSettingsComponent,
    GlycanPositionProfilerComponent,
    GlycanPositionExpComponent,
    SwathLibHelpComponent,
    SubcellularLocationComponent,
    BarChartComponent,
    PieChartComponent,
    SeqViewerComponent,
    ConnectorComponent,
    SequenceHeatmapComponent,
    SequenceVisualizerComponent,
    FileSelectorComponent,
    ContextMenuComponent
  ],
  imports: [
    NgbModule,
    RouterModule.forRoot(
      appRoutes, {useHash: true}
    ),
    FormsModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    OverlayModule
  ],
  providers: [
    AnnoucementService,
    D3Service,
    ExampleService,
    FileHandlerService,
    UniprotService,
    NglycoService,
    PublicationService,
    GrantService,
    SwathLibAssetService,
    SwathResultService,
    SvgAnnotationService,
    SvgContextMenuService,
    ConnectorService,
    GraphService,
    OverlayService
    // SwathLibHelperService
  ],
  bootstrap: [AppComponent],
  entryComponents: [ContextMenuComponent]
})
export class AppModule { }
declare global {
  interface  Array<T> {
    extend(Array: any[]);
  }
}
Array.prototype.extend = function (other_array: any[]) {
  other_array.forEach(function(v) {this.push(v); }, this);
};


