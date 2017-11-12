import { Component, OnInit } from '@angular/core';
import {UniprotService} from '../uniprot.service';
import {NgForm} from '@angular/forms';
import {FileHandlerService} from '../file-handler.service';
import {DataRow, DataStore, Result} from '../data-row';
import {Subscription} from "rxjs/Subscription";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-uniprot-parser',
  templateUrl: './uniprot-parser.component.html',
  styleUrls: ['./uniprot-parser.component.css']
})
export class UniprotParserComponent implements OnInit {
  model = {uniprotList: '', goStats: true};
  results: string[] = [];
  started = false;
  processing = false;
  finished = false;
  fileDownloader;
  downloadResults: Result[] = [];
  uniprot: Observable<Result[]>;
  status: Observable<boolean>;

  constructor(private _uniprot: UniprotService, private _fh: FileHandlerService) {
    this.fileDownloader = _fh.saveFile;
    this.uniprot = _uniprot.UniprotResult;
    this.status = _uniprot.ResultStatus;
  }

  ngOnInit() {
  }

  onSubmit(f: NgForm) {
    console.log(f.value.uniprotList);
    if (f.valid && f.value.uniprotList !== '') {
      this.started = true;
      this.processing = true;
      const ulArray = f.value.uniprotList.split(/\r\n|\n/);
      try {
        this._uniprot.mainUniprotParse(ulArray, f.value.goStats);
      } catch (e) {
        console.log(e);
      }
      this.processing = false;
      this.finished = true;
    }
  }
}
