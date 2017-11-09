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
    const divisor = 4;
    if (f.valid && f.value.uniprotList !== '') {
      this.started = true;
      this.processing = true;
      const ulArray = f.value.uniprotList.split(/\r\n|\n/);
      let quotient = Math.floor(ulArray.length / divisor);
      const remainder = ulArray.length % divisor;
      if (remainder > 0) {
        quotient += 1;
      }
      let mainAcessionlist: string[] = [];

      for (const u of ulArray) {
        if (u.length > 0) {
          const accession = this._uniprot.Re.exec(u);
          if (!mainAcessionlist.includes(accession[0])) {
            mainAcessionlist.push(accession[0]);
          }
        }
      }
      let n = 0;
      while (n < quotient) {
        const options: Map<string, string> = new Map<string, string>([
          ['format', 'tab'],
          ['columns', 'id,entry name,reviewed,protein names,genes,organism,length,database(RefSeq),organism-id,go-id,feature(GLYCOSYLATION),comment(MASS SPECTROMETRY),sequence'],
          ['compress', 'no'],
          ['force', 'no'],
          ['sort', 'score'],
          ['desc', ''],
          ['fil', '']
        ]);
        const accessionList: string[] = [];
        if ((mainAcessionlist.length - divisor * quotient) >= divisor) {
          for (const u of mainAcessionlist.slice(n * quotient, (n + 1) * quotient)) {
            if (u.length > 0) {
              const accession = this._uniprot.Re.exec(u);
              accessionList.push(accession[0]);
            }
          }
        } else {
          for (const u of mainAcessionlist.slice(n * quotient)) {
            if (u.length > 0) {
              const accession = this._uniprot.Re.exec(u);
              accessionList.push(accession[0]);
            }
          }
        }
        mainAcessionlist = mainAcessionlist.concat(accessionList);
        options.set('query', accessionList.join(','));
        n += 1;
        this._uniprot.getUniprot(options)
          .subscribe((data) => {
            console.log(data);
            this.results.push(data.body);
            if (this.results.length === quotient) {
              const merged = new DataStore([], false, 'uniprot_parsed.txt');

              for (const d of this.results) {
                const ds = this._fh.fileHandlerNoE(d);

                if (!merged.header) {
                  merged.header = ds.header;
                }
                merged.data = merged.data.concat(ds.data);
              }
              const s = DataStore.filterRow(mainAcessionlist, 0, merged.data);
              this.downloadResults.push(DataStore.toCSV(merged.header, s[0], 'with_mods_' + merged.fileName, 'Uniprot Parsing Completed'));
              if (s[1].length > 0) {
                this.downloadResults.push(DataStore.toCSV(['Entry'], s[1], 'remain_accession_' + merged.fileName, 'Unsuccessful Match'));
              }
            }
            this.processing = false;
            this.finished = true;
          });

      }
    }
  }
}
