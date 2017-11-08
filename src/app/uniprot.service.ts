import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class UniprotService {
  private baseURL = 'http://www.uniprot.org/uniprot/?sort=score&desc=&compress=no&query="human,yeast"&format=tab&columns=id,entry%20name,reviewed,protein%20names,genes,organism,length,database(RefSeq),organism-id,go-id,go,feature(GLYCOSYLATION)';
  public Re = /[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}/;
  constructor(private http: HttpClient) { }

  getUniprot(options: Map<string, string>) {
    return this.http.get(this.baseURL + this.toParamString(options), {responseType: 'text'});
  }

  toParamString(options: Map<string, string>): string {
    const pArray: string[] = [];
    for (const k of Object.keys(options)) {
      if (options.hasOwnProperty(k)) {
        pArray.push(encodeURI(k + '-' + options[k]));
      }
    }
    return pArray.join('&');
  }
}
