import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {ConnectorUrl} from './connector-url';


@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  urls = [new ConnectorUrl('http://10.89.222.29', false)];
  connectMap = new Map<string, boolean>();
  private connectorModal = new Subject<boolean>();
  connectorModalSignal = this.connectorModal.asObservable();
  constructor(private http: HttpClient) { }

  UpdateURLs(urls: ConnectorUrl[]) {
    this.urls = urls;
  }

  CheckURL(u: string) {
    console.log(u);
    return this.http.get(u, {observe: 'response'});
  }

  SendModalSignal(data: boolean) {
    this.connectorModal.next(data);
  }
}
