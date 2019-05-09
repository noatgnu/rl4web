import { Injectable } from '@angular/core';
import {DataRow, DataStore, Result} from './data-row';
import {Subject} from 'rxjs';
import {NgForm} from '@angular/forms';

@Injectable()
export class NglycoService {
  private _ResultSource = new Subject<Result[]>();
  nGlyResult = this._ResultSource.asObservable();

  private _resultStatusSource = new Subject<boolean>();
  ResultStatus = this._resultStatusSource.asObservable();

  constructor() { }

  updateResult(result: Result[]) {
    this._ResultSource.next(result);
  }

  updateResultStatus(status: boolean) {
    this._resultStatusSource.next(status);
  }

  nGlycoParser(result: DataStore, f: NgForm) {
    const r: Result[] = [];
    let n = 0;
    for (const h of result.header) {
      if (h === f.value.columnName) {
        result.seqColumn = n;
      } else if (h === f.value.modColumn) {
        result.modColumn = n;
      }
      n += 1;
    }
    console.log(result.seqColumn);
    let d = DataStore.filterSequon(f.value.ignoreMod, result.data, result.seqColumn);
    if (f.value.checkPosition) {
      d = this.checkModification(f.value.mod, d, result.modColumn, result.seqColumn);
      result.header.push('Sequon Modification Positions');
    }
    r.push(DataStore.toCSV(result.header, d, 'sequon_parsed_' + result.fileName, 'Sequon parsed'));
    if (f.value.modFilter) {
      const fMod = DataStore.filterMod(f.value.mod.split(','), result.modColumn, d);
      if (fMod[0].length > 0) {
        r.push(DataStore.toCSV(result.header, fMod[0], 'with_mods_' + result.fileName, 'Sequons with modifications ' + f.value.mod));
      }
      if (fMod[1].length > 0) {
        r.push(DataStore.toCSV(result.header, fMod[1], 'without_mods_' + result.fileName, 'Sequons without modifications ' + f.value.mod));
      }
    }
    this.updateResult(r);
    this.updateResultStatus(true);
  }

  checkModification(modifications: string, data: DataRow[], modColumn: number, seqColumn: number) {
    const mods = modifications.split(',');
    for (let i = 0; i <= data.length; i ++) {
      const ms = data[i].row[modColumn].split(';');
      let modifiedSeq = '';
      for (const m of ms) {
        for (const mo of mods) {
          if (m.includes(mo)) {
            const pos = parseInt(m.split('@')[-1], 10);
            if (data[i].row[seqColumn][pos + 1] === 'S' || data[i].row[seqColumn][pos + 1] === 'T') {
              modifiedSeq += pos.toString(10) + ';';
            }
            break;
          }
        }
      }
      data[i].row.push(modifiedSeq);
    }
    return data;
  }
}
