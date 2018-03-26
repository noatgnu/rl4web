import { Component, OnInit } from '@angular/core';
import {SwathLibAssetService} from './swath-lib-asset.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  collapsed = true;
  swathlibActive = true;
  constructor (private mod: SwathLibAssetService) {

  }

  ngOnInit () {
    this.mod.checkServerExist().subscribe((resp) => {
      if (resp.status === 200) {

      }
    });
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }


}
