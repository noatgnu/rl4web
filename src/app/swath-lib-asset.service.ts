import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs/Subject';
import {StaticMod} from './static-mod';
import {VariableMod} from './variable-mod';
import {Modification} from "./helper/modification";


@Injectable()
export class SwathLibAssetService {
  private _staticModsSource = new Subject<Modification[]>();
  private _variableModsSource = new Subject<Modification[]>();
  private _YtypeModsSource = new Subject<Modification[]>();
  private _resultSource = new Subject<SwathResponse>();
  staticMods = this._staticModsSource.asObservable();
  variableMods = this._variableModsSource.asObservable();
  YtypeMods = this._YtypeModsSource.asObservable();
  result = this._resultSource.asObservable();
  private URL = 'http://10.50.193.80:9000/api/swathlib/upload/';
  private resultURL = 'http://10.50.193.80:9000/api/swathlib/result/';
  constructor(private http: HttpClient) { }

  getMods(url) {
    return this.http.get(url, {observe: 'response'});
  }

  uploadForm(form: FormData) {
    console.log(form);
    return this.http.post(this.URL, form);
  }

  updateMods(data) {
    const sMod = [];
    const vMod = [];
    const YMod = [];
    for (const m of data) {
      switch (m.type) {
        case 'static':
          sMod.push(m);
          break;
        case 'variable':
          vMod.push(m);
          break;
        case 'Ytype':
          YMod.push(m);
          break;
      }
    }
    this.updateStaticMods(sMod);
    this.updateVariableMods(vMod);
    this.updateYtypeMods(YMod);
  }

  updateStaticMods(data) {
    this._staticModsSource.next(data);
  }

  updateVariableMods(data) {
    this._variableModsSource.next(data);
  }

  updateYtypeMods(data) {
    this._YtypeModsSource.next(data);
  }
  updateResult(s) {
    s.url = this.resultURL + s.fileName;
    console.log(s);
    this._resultSource.next(s);
  }

  checkServerExist() {
    return this.http.get(this.URL, {observe: 'response'});
  }
}

export class SwathResponse {
  get url(): string {
    return this._url;
  }

  set url(value: string) {
    this._url = value;
  }
  constructor(fileName: string) {
    this._fileName = fileName;
  }
  get fileName(): string {
    return this._fileName;
  }

  set fileName(value: string) {
    this._fileName = value;
  }
  private _fileName: string;
  private _url: string;
}
