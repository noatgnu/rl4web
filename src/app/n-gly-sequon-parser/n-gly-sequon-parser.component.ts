import { Component, OnInit, ViewChild} from '@angular/core';
import {FileHandlerService} from '../file-handler.service';
import {NgForm} from '@angular/forms';
import {DataStore, Result} from '../data-row';
import {NglycoService} from "../nglyco.service";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-n-gly-sequon-parser',
  templateUrl: './n-gly-sequon-parser.component.html',
  styleUrls: ['./n-gly-sequon-parser.component.css']
})
export class NGlySequonParserComponent implements OnInit {
  fileHandler;
  result: DataStore;
  model = {columnName: 'Sequence', ignoreMod: true, modFilter: false, modColumn: 'ProteinModifications', mod: 'HexNAc'};
  loadHeader = true;
  started = false;
  processing = false;
  finished = false;
  fileSize: number;
  fileDownloader;
  downloadResults: Result[] = [];
  nglyResult: Observable<Result[]>;
  statusResult: Observable<boolean>;

  @ViewChild('resultElem') resultElem;
  constructor(private _fh: FileHandlerService, private _ngp: NglycoService) {
    this.fileHandler = _fh.fileHandler;
    this.fileDownloader = _fh.saveFile;
    this.nglyResult = _ngp.nGlyResult;
    this.statusResult = _ngp.ResultStatus;
  }

  ngOnInit() {
  }

  async processFile(e) {
    if (this.downloadResults.length > 0) {
      this.downloadResults = [];
    }
    this.result = await this.fileHandler(e, this.loadHeader);
    this.fileSize = this.result.data.length;
  }

  onSubmit(f: NgForm) {
    console.log(this.result);
    if (f.valid && this.result) {
      this.started = true;
      this.processing = true;
      this._ngp.nGlycoParser(this.result, f);
      this.processing = false;
      this.finished = true;
    }
  }

}
