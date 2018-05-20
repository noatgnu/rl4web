import {Component, OnInit, AfterViewInit, OnDestroy} from '@angular/core';
import {FormBuilder, FormGroup, NgForm} from '@angular/forms';
import {SwathLibAssetService, SwathResponse} from '../swath-lib-asset.service';
import {Observable} from 'rxjs/Observable';
import {VariableMod} from '../variable-mod';
import {Subject} from 'rxjs/Subject';
import {FastaFileService} from '../helper/fasta-file.service';
import {Modification} from '../helper/modification';
import {FastaFile} from '../helper/fasta-file';
import {SwathQuery} from '../helper/swath-query';
import {SwathResultService} from '../helper/swath-result.service';
import {Subscription} from 'rxjs/Subscription';
import {SwathWindows} from "../helper/swath-windows";

@Component({
  selector: 'app-swath-lib',
  templateUrl: './swath-lib.component.html',
  styleUrls: ['./swath-lib.component.css'],
  providers: [FastaFileService],
})
export class SwathLibComponent implements OnInit, AfterViewInit, OnDestroy {
  queryCollection: SwathQuery[];
  form: FormGroup;
  ff;
  fasta: Observable<FastaFile>;
  staticMods: Observable<Modification[]>;
  variableMods: Observable<Modification[]>;
  Ymods: Observable<Modification[]>;
  windows: Observable<SwathWindows[]>;
  selectedStaticMods: Observable<Modification[]>;
  private _selectedSource = new Subject<Modification[]>();
  currentMods: Modification[] = [];
  selectedMod: Modification[];
  selectedVariableMod: VariableMod[];
  private formData: FormData = new FormData();
  result: Observable<SwathResponse>;
  fastaContent: FastaFile;
  resultReader: Observable<SwathQuery>;
  outputSubscription: Subscription;
  collectTrigger = false;
  rt = [];
  constructor(private mod: SwathLibAssetService, private fastaFile: FastaFileService, private fb: FormBuilder, private srs: SwathResultService) {
    this.staticMods = mod.staticMods;
    this.variableMods = mod.variableMods;
    this.Ymods = mod.YtypeMods;
    this.selectedStaticMods = this._selectedSource.asObservable();
    this.windows = mod.windowsReader;
    this.result = mod.result;
    this.ff = fastaFile.fileHandler;
    this.createForm();
    this.fasta = this.fastaFile.fastaFileReader;
    this.resultReader = srs.OutputReader;
    for (let i = 1; i <= 60; i++) {
      this.rt.push(i);
    }
  }

  ngOnInit() {
    this.mod.getAssets('assets/new_mods.json').subscribe((resp) => {
      this.mod.updateMods(resp.body['data']);
    });
    this.mod.getAssets('assets/windows.json').subscribe((resp) => {
      this.mod.updateWindows(resp.body['data']);
    });
    this.outputSubscription = this.resultReader.subscribe((data) => {
      if (this.collectTrigger) {
        this.queryCollection.push(data);
        this.srs.SendOutput(data).subscribe((response) => {

        });
        if (this.queryCollection.length === this.fastaContent.content.length) {

        }
      }

      console.log(data);
    });
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
  }

  createForm() {
    this.form = this.fb.group({
      'static': [],
      'variable': [],
      'ytype': [],
      'rt': [],
      'windows': []
    });
  }

  applyModification() {
    this.form = Object.create(this.form);
    this.fastaFile.UpdateFastaSource(Object.create(this.fastaContent));
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
    this.fastaContent = await this.ff(e);
    this.fastaFile.UpdateFastaSource(this.fastaContent);
  }
}
