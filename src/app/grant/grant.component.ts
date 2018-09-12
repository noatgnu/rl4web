import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Grant} from '../grant';
import {GrantService} from '../grant.service';

@Component({
  selector: 'app-grant',
  templateUrl: './grant.component.html',
  styleUrls: ['./grant.component.scss']
})
export class GrantComponent implements OnInit {
  grant: Observable<Map<string, Grant[]>>;
  loc: string[];
  constructor(private _grant: GrantService) {
    this.grant = _grant.GrantData;
  }

  ngOnInit() {
    this._grant.getGrant('assets/grants.json').subscribe((resp) => {
      const l: string[] = [];
      const mG: Map<string, Grant[]> = new Map();
      for (const r of resp.body['data']) {
        if (!l.includes(r.location)) {
          l.push(r.location);
        }
        if (!mG.has(r.location)) {
          mG.set(r.location, []);
        }
        mG.get(r.location).push(new Grant(r.location, r.start, r.end, r.projectTitle, r.link, r.grantTitle));
      }
      this.loc = l;
      this._grant.updateGrant(mG);
    });
  }


}
