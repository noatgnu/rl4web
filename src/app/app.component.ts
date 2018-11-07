import { Component, OnInit } from '@angular/core';
import {SwathLibAssetService} from './swath-lib-asset.service';
import {Observable} from 'rxjs';
import {AnnoucementService} from './helper/annoucement.service';
import {ConnectorService} from './helper/connector.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'app';
  collapsed = true;
  swathlibActive = true;
  stringArray = ['Glycan Within', 'Glycan Without'];
  footer = '';
  serverStatus: Observable<boolean>;
  annoucement: Observable<string>;
  constructor (private mod: SwathLibAssetService, private anServ: AnnoucementService, private connector: ConnectorService) {
    this.serverStatus = this.mod.statusReader;
    this.annoucement = this.anServ.annoucementReader;
  }

  ngOnInit () {
    this.randomString();
    this.mod.checkServerExist().subscribe((resp) => {
      if (resp.status === 200) {
        this.mod.updateServerStatus(true);
      } else {
        this.mod.updateServerStatus(false);
      }
    }, (err) => {
      this.mod.updateServerStatus(false);
    });
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  randomString() {
    const randomNumb = Math.floor(Math.random() * this.stringArray.length);
    this.footer = this.stringArray[randomNumb];
  }

  OpenConnectorModal() {
    this.connector.SendModalSignal(true);
  }
}
