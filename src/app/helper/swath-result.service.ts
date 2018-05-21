import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs/Subject';
import {SwathQuery} from './swath-query';

@Injectable()
export class SwathResultService {
  private _outputSource = new Subject<SwathQuery>();
  OutputReader = this._outputSource.asObservable();
  private _sendTrigger = new Subject<boolean>();
  sendTriggerReader = this._sendTrigger.asObservable();

  constructor(private http: HttpClient) { }
  private URL = 'http://10.89.221.44:9000/api/swathlib/upload/';
  private resultURL = 'http://10.50.193.80:9000/api/swathlib/result/';
  UpdateOutput(data) {
    this._outputSource.next(data);
  }

  SendQuery(data: SwathQuery) {
    for (const m of data.modifications) {
      for (const key in m) {
        m[key] = m[key];
      }
    }
    return this.http.put(this.URL, data, {observe: 'response'});
  }

  UpdateSendTrigger(data) {
    this._sendTrigger.next(data);
  }
}
