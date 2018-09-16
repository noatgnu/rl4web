import {Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ConnectorService} from '../helper/connector.service';
import {Observable, Subscription} from 'rxjs';
import {NgbModal, NgbModalRef} from '@ng-bootstrap/ng-bootstrap';
import 'rxjs/add/operator/catch';
import {ConnectorUrl} from "../helper/connector-url";

@Component({
  selector: 'app-connector',
  templateUrl: './connector.component.html',
  styleUrls: ['./connector.component.scss']
})
export class ConnectorComponent implements OnInit, OnDestroy {
  @ViewChild('serverConnection') serverConnection;
  connectorSignal: Observable<boolean>;
  signalSub: Subscription;
  ref: NgbModalRef;
  urls;
  urlStatusMap: Map<string, ConnectorUrl>;
  constructor(private connector: ConnectorService, private modal: NgbModal) {
    this.connectorSignal = this.connector.connectorModalSignal;
    this.urls = this.connector.urls;
  }

  ngOnInit() {
    this.urlStatusMap = new Map<string, ConnectorUrl>();
    for (let i = 0; i < this.urls.length; i ++) {
      this.urlStatusMap.set(this.urls[i].url, this.urls[i]);
    }

    this.signalSub = this.connectorSignal.subscribe((data) => {
      if (data) {
        this.ref = this.modal.open(this.serverConnection);
        for (const c of this.urls) {
          this.checkUrl(c.url);
        }
      } else {
        if (this.ref !== undefined) {
          this.ref.dismiss();
        }
      }
    });
  }

  checkUrl(url) {
    this.connector.CheckURL(url).subscribe((resp) => {
      this.urlStatusMap.get(url).status = resp.status === 200;
    }, (err) => {
      this.urlStatusMap.get(url).status = false;
    });
  }

  ngOnDestroy() {
    this.signalSub.unsubscribe();
  }
}
