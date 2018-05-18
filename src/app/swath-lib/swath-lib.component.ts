import { Component, OnInit, AfterViewInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {SwathLibAssetService, SwathResponse} from '../swath-lib-asset.service';
import {Observable} from 'rxjs/Observable';
import {StaticMod} from '../static-mod';
import {VariableMod} from '../variable-mod';
import {Subject} from 'rxjs/Subject';
import {FastaFileService} from '../helper/fasta-file.service';
import {Modification} from '../helper/modification';



@Component({
  selector: 'app-swath-lib',
  templateUrl: './swath-lib.component.html',
  styleUrls: ['./swath-lib.component.css'],
  providers: [FastaFileService]
})
export class SwathLibComponent implements OnInit, AfterViewInit {
  ff;
  fasta;
  staticMods: Observable<Modification[]>;
  variableMods: Observable<Modification[]>;
  Ymods: Observable<Modification[]>;
  selectedStaticMods: Observable<Modification[]>;
  private _selectedSource = new Subject<Modification[]>();
  currentMods: Modification[] = [];
  selectedMod: Modification[];
  selectedVariableMod: VariableMod[];
  private formData: FormData = new FormData();
  result: Observable<SwathResponse>;

  constructor(private mod: SwathLibAssetService, private fastaFile: FastaFileService) {
    this.staticMods = mod.staticMods;
    this.variableMods = mod.variableMods;
    this.Ymods = mod.YtypeMods;
    this.selectedStaticMods = this._selectedSource.asObservable();
    this.result = mod.result;
    this.ff = fastaFile.fileHandler;
  }

  ngOnInit() {
    this.mod.getMods('assets/new_mods.json').subscribe((resp) => {
      this.mod.updateMods(resp.body['data']);
    });
  }

  getFile(event, handle) {
    if (event.target.files && event.target.files.length > 0) {
      const fileList: FileList = event.target.files;
      if (this.formData.has(handle)) {
        this.formData.set(handle, fileList[0], fileList[0].name);
      } else {
        this.formData.append(handle, fileList[0], fileList[0].name);
      }
    }
  }

  checkForm() {
    return this.formData.has('fasta') && this.formData.has('windows');
  }

  onSubmit(f: NgForm) {
    console.log(f);
    if (f.valid) {
      if (this.formData.has('static')) {
        this.formData.set('static', JSON.stringify(this.currentMods));
      } else {
        this.formData.append('static', JSON.stringify(this.currentMods));
      }
      if (this.formData.has('variable')) {
        this.formData.set('variable', JSON.stringify(this.selectedVariableMod));
      } else {
        this.formData.append('variable', JSON.stringify(this.selectedVariableMod));
      }

      this.mod.uploadForm(this.formData).subscribe((resp) => {
        console.log(resp);
        this.mod.updateResult(resp);
      });
    }
  }

  addSelected(newMods) {
    for (const i of newMods) {
      if (this.currentMods.indexOf(i) === -1) {
        this.currentMods.push(i);
      }
    }
    this._selectedSource.next(this.currentMods);
  }

  removeSelected(removeMods) {
    for (const i of removeMods) {
      const r = this.currentMods.indexOf(i);
      if (r !== -1) {
        this.currentMods.splice(r, 1);
      }
    }

    this._selectedSource.next(this.currentMods);
  }

  ngAfterViewInit() {

  }

  getCurrentDate() {
    return Date.now();
  }

  async loadFasta(e) {
    this.fasta = await this.ff(e);

  }
}
