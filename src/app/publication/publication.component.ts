import { Component, OnInit } from '@angular/core';
import {PublicationService} from '../publication.service';
import {Observable} from 'rxjs/Observable';
import {Publication, RefData} from '../publication';

@Component({
  selector: 'app-publication',
  templateUrl: './publication.component.html',
  styleUrls: ['./publication.component.css']
})
export class PublicationComponent implements OnInit {
  publication: Observable<RefData>;
  book: Observable<RefData>;
  conference: Observable<RefData>;

  constructor(private _pub: PublicationService) {
    this.publication = _pub.PublicationData;
    this.book = _pub.BookData;
    this.conference = _pub.ConferenceData;
  }

  ngOnInit() {
    this._pub.getPublication('assets/publications.json').subscribe((resp) => {
      const p = this.toPubArray(resp);
      this._pub.updatePublication(p);
    });
    this._pub.getPublication('assets/books.json').subscribe((resp) => {
      const p = this.toPubArray(resp);
      this._pub.updateBook(p);
    });
    this._pub.getPublication('assets/conferences.json').subscribe((resp) => {
      const p = this.toPubArray(resp);
      this._pub.updateConference(p);
    });
  }

  toPubArray(resp): Publication[] {
    return resp.body['data'].map(p => new Publication(p.title, p.link, p.year, p.refFormat));
  }
}
