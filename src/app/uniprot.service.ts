import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class UniprotService {
  private baseURL = 'http://www.uniprot.org/uniprot/?';
  public Re = /[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}/;
  constructor(private http: HttpClient) { }

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
}
