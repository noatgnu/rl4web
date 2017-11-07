import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable()
export class UniprotService {

  constructor(http: HttpClient) { }
  private baseURL = 'http://www.uniprot.org/uniprot/?sort=score&desc=&compress=no&query=yeast&fil=&limit=10&force=no&preview=true&format=json&columns=id,entry%20name,reviewed,protein%20names,genes,organism,length,database(RefSeq),organism-id,go-id,go,feature(GLYCOSYLATION)';

}
