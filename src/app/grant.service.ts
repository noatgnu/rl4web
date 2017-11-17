import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs/Subject';
import {Grant} from "./grant";


@Injectable()
export class GrantService {
  private _grantSource = new Subject<Map<string, Grant[]>>();
  GrantData = this._grantSource.asObservable();
  constructor(private http: HttpClient) { }

  getGrant(url: string) {
    return this.http.get(url, {observe: 'response'});
  }

  updateGrant(data) {
    this._grantSource.next(data);
  }
}
