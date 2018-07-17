import { Component, OnInit, OnDestroy } from '@angular/core';
import {UniprotService} from '../uniprot.service';
import {NgForm} from '@angular/forms';
import {FileHandlerService} from '../file-handler.service';
import {DataRow, DataStore, Result} from '../data-row';
import {Subscription} from 'rxjs/Subscription';
import {Observable} from 'rxjs/Observable';
import {modelGroupProvider} from '@angular/forms/src/directives/ng_model_group';

@Component({
  selector: 'app-uniprot-parser',
  templateUrl: './uniprot-parser.component.html',
  styleUrls: ['./uniprot-parser.component.css']
})
export class UniprotParserComponent implements OnInit, OnDestroy {
  model = {uniprotList: '', goStats: true};
  results: string[] = [];
  started = false;
  processing = false;
  finished = false;
  fileDownloader;
  downloadResults: Result[] = [];
  status: Observable<boolean>;
  resultSub: Subscription;
  result: Result[] = [];
  findf: DataStore;
  remain: DataStore;
  go: DataStore;
  count = 0;
  currentTime;
  constructor(private _uniprot: UniprotService, private _fh: FileHandlerService) {
    this.fileDownloader = _fh.saveFile;
    this.status = _uniprot.ResultStatus;
  }

  ngOnDestroy() {
    this.resultSub.unsubscribe();
  }

  ngOnInit() {
    this.findf = new DataStore([], false, `Uniprot_Parsed.txt`);
    this.remain = new DataStore([], false, `Uniprot_Parsed.txt`);
    this.resultSub = this._uniprot.UniprotResult.subscribe((data) => {
      const s = DataStore.filterRow(data.Entries, 0, data.DataFrame.data);
      this.count -= data.Entries.length;
      if (data.DataFrame.header.length > 0) {
        this.findf.header = data.DataFrame.header;
      }
      this.findf.data.extend(s[0]);
      if (s[1].length > 0) {
        this.remain.data.extend(s[1]);
      }
      console.log(this.count);
      if (this.count === 0) {
        this.result.push(DataStore.toCSV(this.findf.header, this.findf.data, data.DataFrame.fileName, 'Uniprot Parsing Completed'));
        this.result.push(DataStore.toCSV(['Entry'], this.remain.data, 'remaining_accession_' + data.DataFrame.fileName, 'Unsuccessful Match'));
        if (this.model.goStats) {
          const go = DataStore.getGO(this.findf.header, this.findf.data);
          this.result.push(DataStore.toCSV(go.header, go.data, 'gostats_' + data.DataFrame.fileName, 'GOStats Association File'));
        }
        this._uniprot.updateResultStatus(true);
        this.currentTime = this.getCurrentDate();
      }
    });

  }

  getCurrentDate() {
    return Date.now();
  }

  onSubmit(f: NgForm) {
    console.log(f.value.uniprotList);
    if (f.valid && f.value.uniprotList !== '') {
      this.findf = new DataStore([], false, `Uniprot_Parsed.txt`);
      this.remain = new DataStore([], false, `Uniprot_Parsed.txt`);
      this.result = [];
      this.started = true;
      this.processing = true;
      const ulArray = f.value.uniprotList.split(/\r\n|\n/);
      const acL = [];
      for (const a of ulArray) {
        const accession = this._uniprot.Re.exec(a);
        if (accession !== null) {
          acL.push(accession[0]);
        }
      }
      this.count = acL.length;
      try {
        this._uniprot.UniProtParseGet(acL, f.value.goStats);
        // this._uniprot.mainUniprotParse(ulArray, f.value.goStats);
      } catch (e) {
        console.log(e);
      }
      this.processing = false;
      this.finished = true;
    }
  }
}
