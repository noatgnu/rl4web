import { Component, OnInit } from '@angular/core';
import {UniprotService} from '../uniprot.service';
import {NgForm} from '@angular/forms';
import {FileHandlerService} from '../file-handler.service';
import {DataRow, DataStore, Result} from '../data-row';

@Component({
  selector: 'app-uniprot-parser',
  templateUrl: './uniprot-parser.component.html',
  styleUrls: ['./uniprot-parser.component.css']
})
export class UniprotParserComponent implements OnInit {
  model = {uniprotList: ''};
  results: string[] = [];
  started = false;
  processing = false;
  finished = false;
  fileDownloader;
  downloadResults: Result[] = [];
  constructor(private _uniprot: UniprotService, private _fh: FileHandlerService) {
    this.fileDownloader = _fh.saveFile;
  }

  ngOnInit() {
  }

  onSubmit(f: NgForm) {
    const divisor = 2;
    if (f.valid && f.value.uniprotList !== '') {
      this.started = true;
      this.processing = true;
      const ulArray = f.value.uniprotList.split(/\r\n|\n/);
      let quotient = Math.floor(ulArray.length / divisor);
      const remainder = ulArray.length % divisor;
      if (remainder > 0) {
        quotient += 1;
      }

      let n = 0;
      while (n < quotient) {
        const options: Map<string, string> = new Map<string, string>([
          ['format', 'tab'],
          ['column', 'id,entry name,reviewed,protein names,genes,organism,length,database(RefSeq),organism-id,go-id,feature(GLYCOSYLATION),comment(MASS SPECTROMETRY),sequence'],
          ['compress', 'no']
        ]);
        const accessionList: string[] = [];
        if ((ulArray.length - divisor * quotient) >= divisor) {
          for (const u of ulArray.slice(n * quotient, (n + 1) * quotient)) {
            const accession = u.match(this._uniprot.Re);
            accessionList.push(accession);
          }
          options.set('query', accessionList.join(','));

        } else {
          for (const u of ulArray.slice(n * quotient)) {
            const accession = u.match(this._uniprot.Re);
            accessionList.push(accession);
          }
        }
        this._uniprot.getUniprot(options)
          .subscribe((data) => {
            this.results.push(data);
            if (this.results.length === quotient) {
              const merged = new DataStore([], false, 'uniprot_parsed.txt');
              for (const d of this.results) {
                const ds = this._fh.fileHandlerNoE(d);
                if (!merged.header) {
                  merged.header = ds.header;
                }
                merged.data = merged.data.concat(ds.data);
              }
              this.downloadResults.push(DataStore.toCSV(merged.header, merged.data, 'with_mods_' + merged.fileName, 'Uniprot Parsing Completed'));
            }
            this.finished = true;
          });
        n += 1;
      }
    }
  }
}
