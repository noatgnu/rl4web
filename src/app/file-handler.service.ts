import { Injectable } from '@angular/core';
import {DataRow, DataStore} from "./data-row";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

@Injectable()
export class FileHandlerService {
  _resultFileSource: Subject<DataStore[]> = new Subject<DataStore[]>();
  resultFileEmitter: Observable<DataStore[]> = this._resultFileSource.asObservable();

  constructor() { }

  async fileHandler(e, loadHeader) {
    return new Promise<DataStore>((resolve, reject)=> {
      const file = e.target.files[0];
      let reader = new FileReader();
      let result: DataRow[] = [];
      reader.onload = (event) => {
        const loadedFile = reader.result;
        console.log();
        const lines = loadedFile.split(/\r\n|\n/);
        lines.map((line)=>{
          if (line.length > 0) {
            result.push(new DataRow(line.split(/\t/)));
          }
        });
        resolve(new DataStore(result, loadHeader, file.name))
      };
      reader.readAsText(file);
    });
  }


}
