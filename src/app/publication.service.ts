import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';
import {RefData} from './publication';

@Injectable()
export class PublicationService {
  private _publicationSource = new Subject<RefData>();
  PublicationData = this._publicationSource.asObservable();

  private _bookSource = new Subject<RefData>();
  BookData = this._bookSource.asObservable();

  private _conferenceSource = new Subject<RefData>();
  ConferenceData = this._conferenceSource.asObservable();
  constructor(private http: HttpClient) { }

  getPublication(url: string) {
    return this.http.get(url, {observe: 'response'});
  }

  updatePublication(data) {
    const p = new RefData('Publications', data);
    this._publicationSource.next(p);
  }

  updateBook(data) {
    const p = new RefData('Books', data);
    this._bookSource.next(p);
  }

  updateConference(data) {
    const p = new RefData('Conferences', data);
    this._conferenceSource.next(p);
  }
}
