import { Component, OnInit, ViewChild} from '@angular/core';
import {FileHandlerService} from "../file-handler.service";
import {NgForm} from "@angular/forms";
import {DataStore} from "../data-row";
import {DomSanitizer, SafeUrl} from "@angular/platform-browser";

@Component({
  selector: 'app-n-gly-sequon-parser',
  templateUrl: './n-gly-sequon-parser.component.html',
  styleUrls: ['./n-gly-sequon-parser.component.css']
})
export class NGlySequonParserComponent implements OnInit {
  fileHandler;
  result: DataStore;
  model = {columnName: "Sequence", ignoreMod: true};
  loadHeader = true;
  started = false;
  processing = false;
  finished = false;
  fileSize: number;
  downloadLinks: string[] = [];
  safeDownloadLink: SafeUrl[] = [];
  sanitize;

  @ViewChild("resultElem") resultElem;
  constructor(_fh: FileHandlerService, private sanitization: DomSanitizer) {
    this.fileHandler = _fh.fileHandler;
  }

  ngOnInit() {
  }

  async processFile(e){
    if (this.downloadLinks.length > 0) {
      for (let link of this.downloadLinks) {
        URL.revokeObjectURL(link);
      }
      this.downloadLinks = [];
      this.safeDownloadLink = [];
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
        if (item == f.value.columnName) {
          this.result.seqColumn = index;
        }
      });
      console.log(this.result.seqColumn);
      let d = DataStore.filterSequon(f.value.ignoreMod, this.result.data, this.result.seqColumn);
      this.downloadLinks.push(DataStore.toCSV(this.result.header, d));
      for (let link of this.downloadLinks) {
        this.safeDownloadLink.push(this.sanitization.bypassSecurityTrustResourceUrl(link));
      }
      this.processing = false;
      this.finished = true;
    }
  }

}
