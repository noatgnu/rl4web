import { Component, OnInit } from '@angular/core';
import {SwathWindows} from '../../helper/swath-windows';
import {Modification} from '../../helper/modification';
import {SwathLibAssetService} from '../../swath-lib-asset.service';
import {FileHandlerService} from '../../file-handler.service';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent implements OnInit {
  sf;
  constructor(private mod: SwathLibAssetService, private _fh: FileHandlerService) {
    this.sf = this._fh.fileHandler;
  }

  ngOnInit() {
  }

  async loadSettings(e, settingCat) {
    const content = await this.sf(e, true);
    switch (settingCat) {
      case 'mod-lib':
        const mods: Modification[] = [];
        console.log(content.columnMap);
        console.log(content.data);
        for (const r of content.data) {
          const m = new Modification([], false, false, r.row[content.columnMap.get('Ytype')], 'FALSE', r.row[content.columnMap.get('type')], parseFloat(r.row[content.columnMap.get('mass')]), r.row[content.columnMap.get('regex')], r.row[content.columnMap.get('label')], r.row[content.columnMap.get('name')], r.row[content.columnMap.get('m_label')]);
          mods.push(m);
        }
        console.log(mods);
        this.mod.updateMods(mods);
        break;
      case 'swath-win':
        const windows = [];
        for (const r of content.data) {
          windows.push(new SwathWindows(parseInt(r.row[0], 10), parseInt(r.row[1], 10)));
        }
        console.log(windows);
        this.mod.updateWindows(windows);
        break;
    }
  }
}
