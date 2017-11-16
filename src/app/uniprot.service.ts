import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DataStore, Result} from './data-row';
import {FileHandlerService} from './file-handler.service';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class UniprotService {
  private baseURL = 'http://www.uniprot.org/uniprot/?';
  public Re = /[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}/;
  results: string[] = [];

  private _ResultSource = new Subject<Result[]>();
  UniprotResult = this._ResultSource.asObservable();

  private _resultStatusSource = new Subject<boolean>();
  ResultStatus = this._resultStatusSource.asObservable();

  constructor(private http: HttpClient, private _fh: FileHandlerService) { }

  getUniprot(options: Map<string, string>) {
    console.log(this.baseURL + this.toParamString(options));
    return this.http.get(this.baseURL + this.toParamString(options), {responseType: 'text', observe: 'response'});
  }

  toParamString(options: Map<string, string>): string {
    const pArray: string[] = [];
    options.forEach((value, key) => {
      pArray.push(encodeURI(key + '=' + value));
    });

    return pArray.join('&');
  }

  updateUniprotResult(result: Result[]) {
    this._ResultSource.next(result);
  }

  updateResultStatus(status: boolean) {
    this._resultStatusSource.next(status);
  }

  mainUniprotParse(accList: string[], goStats: boolean) {
    this.updateResultStatus(false);
    const result: Result[] = [];
    let mainAcessionlist: string[] = [];
    const divisor = 300;
    for (const u of accList) {
      if (u.length > 0) {
        const accession = this.Re.exec(u);
        if (!mainAcessionlist.includes(accession[0])) {
          mainAcessionlist.push(accession[0]);
        }
      }
    }
    let quotient = Math.floor(mainAcessionlist.length / divisor);
    const remainder = mainAcessionlist.length % divisor;
    if (remainder > 0) {
      quotient += 1;
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
            const accession = this.Re.exec(u);
            accessionList.push(accession[0]);
          }
        }
      } else {
        for (const u of mainAcessionlist.slice(n * quotient)) {
          if (u.length > 0) {
            const accession = this.Re.exec(u);
            accessionList.push(accession[0]);
          }
        }
      }
      mainAcessionlist = mainAcessionlist.concat(accessionList);
      options.set('query', accessionList.join(','));
      n += 1;
      this.getUniprot(options)
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
            result.push(DataStore.toCSV(merged.header, s[0], 'with_mods_' + merged.fileName, 'Uniprot Parsing Completed'));
            if (s[1].length > 0) {
              result.push(DataStore.toCSV(['Entry'], s[1], 'remain_accession_' + merged.fileName, 'Unsuccessful Match'));
            }
            if (goStats) {
              const go = DataStore.getGO(merged.header, merged.data);
              result.push(DataStore.toCSV(go.header, go.data, 'gostats_' + merged.fileName, 'GOStats Association File'));
            }
            this.updateResultStatus(true);
            this.updateUniprotResult(result);
          }
        });
    }
  }
}
