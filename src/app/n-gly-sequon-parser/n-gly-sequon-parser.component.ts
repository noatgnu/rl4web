import { Component, OnInit, ViewChild} from '@angular/core';
import {FileHandlerService} from '../file-handler.service';
import {NgForm} from '@angular/forms';
import {DataStore, Result} from '../data-row';

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

  @ViewChild('resultElem') resultElem;
  constructor(_fh: FileHandlerService) {
    this.fileHandler = _fh.fileHandler;
    this.fileDownloader = _fh.saveFile;
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
      this.result.header.forEach((item, index) => {
        if (item === f.value.columnName) {
          this.result.seqColumn = index;
        } else if (item === f.value.modColumn) {
          this.result.modColumn = index;
        }
      });
      console.log(this.result.seqColumn);
      const d = DataStore.filterSequon(f.value.ignoreMod, this.result.data, this.result.seqColumn);
      this.downloadResults.push(DataStore.toCSV(this.result.header, d, 'sequon_parsed_' + this.result.fileName, 'Sequon parsed'));
      if (f.value.modFilter) {
        const fMod = DataStore.filterMod(f.value.mod.split(','), this.result.modColumn, d);
        if (fMod[0].length > 0) {
          this.downloadResults.push(DataStore.toCSV(this.result.header, fMod[0], 'with_mods_' + this.result.fileName, 'Sequons with modifications ' + f.value.mod));
        }
        if (fMod[1].length > 0) {
          this.downloadResults.push(DataStore.toCSV(this.result.header, fMod[1], 'without_mods_' + this.result.fileName, 'Sequons without modifications ' + f.value.mod));
        }
      }
      this.processing = false;
      this.finished = true;
    }
  }

}
