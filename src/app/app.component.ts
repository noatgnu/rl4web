import { Component, OnInit } from '@angular/core';
import {SwathLibAssetService} from './swath-lib-asset.service';
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  collapsed = true;
  swathlibActive = true;
  stringArray = ['Glycan Within', 'Glycan Without'];
  footer = '';
  serverStatus: Observable<boolean>;
  constructor (private mod: SwathLibAssetService) {
    this.serverStatus = this.mod.statusReader;
  }

  ngOnInit () {
    this.randomString();
    this.mod.checkServerExist().subscribe((resp) => {
      if (resp.status === 200) {
        this.mod.updateServerStatus(true);
      } else {
        this.mod.updateServerStatus(false);
      }
    });
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  randomString() {
    const randomNumb = Math.floor(Math.random() * this.stringArray.length);
    this.footer = this.stringArray[randomNumb];
  }
}
