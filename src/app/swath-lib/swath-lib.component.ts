import {Component, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SwathLibAssetService, SwathResponse} from '../swath-lib-asset.service';
import {Observable} from 'rxjs/Observable';
import {VariableMod} from '../variable-mod';
import {Subject} from 'rxjs/Subject';
import {FastaFileService} from '../helper/fasta-file.service';
import {Modification} from '../helper/modification';
import {FastaFile} from '../helper/fasta-file';
import {SwathQuery} from '../helper/swath-query';
import {SwathResultService} from '../helper/swath-result.service';
import {Subscription} from 'rxjs/Subscription';
import {SwathWindows} from '../helper/swath-windows';
import {DataStore, Result} from '../data-row';
import {FileHandlerService} from '../file-handler.service';
import {Oxonium} from '../helper/oxonium';
import {AnnoucementService} from '../helper/annoucement.service';
import * as TextEncoding from 'text-encoding';
import {BaseUrl} from '../helper/base-url';

@Component({
  selector: 'app-swath-lib',
  templateUrl: './swath-lib.component.html',
  styleUrls: ['./swath-lib.component.css'],
  providers: [FastaFileService],
})
export class SwathLibComponent implements OnInit, AfterViewInit, OnDestroy {
  finishedTime;
  fileDownloader;
  queryCollection: SwathQuery[] = [];
  resultCollection: DataStore[] = [];
  form: FormGroup;
  ff;
  sf;
  fasta: Observable<FastaFile>;
  staticMods: Observable<Modification[]>;
  variableMods: Observable<Modification[]>;
  Ymods: Observable<Modification[]>;
  windows: Observable<SwathWindows[]>;
  oxonium: Observable<Oxonium[]>;
  finished: boolean;
  selectedStaticMods: Observable<Modification[]>;
  private _selectedSource = new Subject<Modification[]>();
  result: Observable<SwathResponse>;
  fastaContent: FastaFile;
  resultReader: Observable<DataStore>;
  outputSubscription: Subscription;
  collectTrigger = false;
  rt = [];
  passForm: FormGroup;
  findf: DataStore;
  bu = new BaseUrl();
  constructor(private mod: SwathLibAssetService, private fastaFile: FastaFileService, private fb: FormBuilder, private srs: SwathResultService, private _fh: FileHandlerService, private anSer: AnnoucementService) {
    this.staticMods = mod.staticMods;
    this.variableMods = mod.variableMods;
    this.Ymods = mod.YtypeMods;
    this.oxonium = mod.oxoniumReader;
    this.selectedStaticMods = this._selectedSource.asObservable();
    this.windows = mod.windowsReader;
    this.result = mod.result;
    this.ff = fastaFile.fileHandler;
    this.sf = _fh.fileHandler;
    this.createForm();
    this.fasta = this.fastaFile.fastaFileReader;
    this.resultReader = srs.OutputReader;
    for (let i = 1; i <= 60; i++) {
      this.rt.push(i);
    }
    this.fileDownloader = this._fh.saveFile;
  }

  ngOnInit() {
    // this._fh.setMitmLocation('https://jimmywarting.github.io/StreamSaver.js/mitm.html');
    this._fh.setMitmLocation(location.protocol + '//' + 'schulzlab.glycoproteo.me' + '/assets/StreamSaver.js/mitm.html');
    this._fh.mitmLocation();
    console.log(this._fh.checkSaveStreamSupport());

    this.mod.getAssets('assets/new_mods.json').subscribe((resp) => {
      this.mod.updateMods(resp.body['data']);
    });
    this.mod.getAssets('assets/windows.json').subscribe((resp) => {
      this.mod.updateWindows(resp.body['data']);
    });
    this.mod.getAssets('assets/oxonium_ions.json').subscribe((resp) => {
      this.mod.updateOxonium(resp.body['data']);
    });
    this.outputSubscription = this.resultReader.subscribe((data) => {
      if (this.collectTrigger) {
        this.resultCollection.push(data);
        this.anSer.Announce(`Processed ${this.resultCollection.length} of ${this.fastaContent.content.length}`);
        if (this.resultCollection.length === this.fastaContent.content.length) {
          this.finishedTime = this.getCurrentDate();
          this.finished = true;
          this.collectTrigger = false;
          this.anSer.Announce('All results have been collected.');
        }
      }
    });
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
  }

  createForm() {
    this.form = this.fb.group({
      'static': [],
      'variable': [],
      'ytype': [],
      'rt': [],
      'windows': [],
      'oxonium': [],
      'extra-mass': 0,
      'precursor-charge': 2,
      'max-charge': 2,
      'ion-type': '',
      'variable-bracket-format': 'windows'
    });
  }

  applyModification() {
    console.log(this.form.value);
    this.passForm = Object.create(this.form);
    this.fastaFile.UpdateFastaSource(Object.create(this.fastaContent));
  }

  ngAfterViewInit() {

  }

  getCurrentDate() {
    return Date.now();
  }

  async loadFasta(e) {
    if (e) {
      this.fastaContent = await this.ff(e);
      this.passForm = Object.create(this.form);
      this.fastaFile.UpdateFastaSource(Object.create(this.fastaContent));
    }
  }

  SendQueries() {
    this.finished = false;
    this.collectTrigger = true;
    this.queryCollection = [];
    this.resultCollection = [];
    this.anSer.Announce('Queries submitted. Waiting for processing...');
    this.srs.UpdateSendTrigger(true);
  }

  downloadFile() {
    let count = 0;
    if (this._fh.checkSaveStreamSupport()) {
      this.anSer.Announce('Starting stream.');
      const fileStream = this._fh.createSaveStream(`${this.fastaContent.name}_library.txt`);
      const writer = fileStream.getWriter();
      const encoder = new TextEncoding.TextEncoder;
      let writeHeader = false;
      for (const r of this.resultCollection) {
        count++;
        if (r.header !== undefined) {
          if (writeHeader === false) {
            const uint8array = encoder.encode(r.header.join('\t') + '\n');
            writer.write(uint8array);
            writeHeader = true;
          }
          if (r.data.constructor === Array) {
            if (r.data.length > 0) {
              for (const row of r.data) {
                if (row.row !== undefined) {
                  const uint8array = encoder.encode(row.row.join('\t') + '\n');
                  writer.write(uint8array);
                }
              }
            }
          }
        }
      }
      writer.close();
    } else {
      this.anSer.Announce('Stream not supported. Fallback to FileSaver.');
      this.findf = new DataStore([], false, `${this.fastaContent.name}_library.txt`);
      for (const r of this.resultCollection) {
        count ++;
        if (r.header !== undefined) {
          if (r.data.constructor === Array) {
            this.findf.header = r.header;
            this.findf.data.extend(r.data);
          }
        }
        this.anSer.Announce(`Compiled ${count} of ${this.resultCollection.length}`);
      }
      this.anSer.Announce(`Compiled ${count} of ${this.resultCollection.length}`);
      const txtResult = DataStore.toCSV(this.findf.header, this.findf.data, this.findf.fileName, this.findf.fileName);
      this._fh.saveFile(txtResult.content, txtResult.fileName);
    }
    this.anSer.Announce('Finished.');
  }
}
