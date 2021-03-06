import {Component, OnInit, AfterViewInit, OnDestroy, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {SwathLibAssetService, SwathResponse} from '../swath-lib-asset.service';
import {Observable, Subject, Subscription} from 'rxjs';
import {VariableMod} from '../variable-mod';
import {FastaFileService} from '../helper/fasta-file.service';
import {Modification} from '../helper/modification';
import {FastaFile} from '../helper/fasta-file';
import {SwathQuery} from '../helper/swath-query';
import {SwathResultService} from '../helper/swath-result.service';
import {SwathWindows} from '../helper/swath-windows';
import {DataStore, Result} from '../data-row';
import {FileHandlerService} from '../file-handler.service';
import {Oxonium} from '../helper/oxonium';
import {AnnoucementService} from '../helper/annoucement.service';
import * as TextEncoding from 'text-encoding';
import {BaseUrl} from '../helper/base-url';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Protein} from '../helper/protein';
import {SwathLibHelperService} from '../helper/swath-lib-helper.service';
import {AARule, DigestRule} from '../helper/digest-rule';
import {UniprotService} from '../uniprot.service';
import {OverlayService} from '../overlay.service';

@Component({
  selector: 'app-swath-lib',
  templateUrl: './swath-lib.component.html',
  styleUrls: ['./swath-lib.component.scss'],
  providers: [FastaFileService, UniprotService],
})
export class SwathLibComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('trypticDigest') trypticDigest;
  currentAllBoxes = true;
  finishedTime;
  fileDownloader;
  queryCollection: SwathQuery[] = [];
  resultCollection: DataStore[] = [];
  form: FormGroup;
  ff;
  sf;
  fasta: Observable<FastaFile>;
  staticMods: Observable<Modification[]>;
  variableMods: Observable<Modification[]>;
  Ymods: Observable<Modification[]>;
  windows: Observable<SwathWindows[]>;
  oxonium: Observable<Oxonium[]>;
  finished: boolean;
  selectedStaticMods: Observable<Modification[]>;
  private _selectedSource = new Subject<Modification[]>();
  result: Observable<SwathResponse>;
  fastaContent: FastaFile;
  resultReader: Observable<DataStore>;
  digestRules: Observable<any>;
  outputSubscription: Subscription;
  collectTrigger = false;
  rt = [];
  passForm: FormGroup;
  findf: DataStore;
  errSub: Subscription;
  fastaRaw = '';
  file;
  digestMap;
  fileName = '';
  tempFastaContent;
  uniprotSub: Subscription;
  uniprotMap: Map<string, Protein>;
  colorMap: Map<boolean, string> = new Map<boolean, string>([[true, '-primary'], [false, '']]);
  regexFilter;
  filterChoice;
  acceptTrack = 0;
  acceptedProtein = [];
  constructor(private mod: SwathLibAssetService, private fastaFile: FastaFileService, private fb: FormBuilder,
              private srs: SwathResultService, private _fh: FileHandlerService, private anSer: AnnoucementService,
              private modalService: NgbModal, private swathHelper: SwathLibHelperService, private uniprot: UniprotService, private overlay: OverlayService) {
    this.staticMods = mod.staticMods;
    this.variableMods = mod.variableMods;
    this.Ymods = mod.YtypeMods;
    this.oxonium = mod.oxoniumReader;
    this.selectedStaticMods = this._selectedSource.asObservable();
    this.windows = mod.windowsReader;
    this.result = mod.result;
    this.ff = fastaFile.fileHandler;
    this.sf = _fh.fileHandler;
    this.createForm();
    this.fasta = this.fastaFile.fastaFileReader;
    this.resultReader = srs.OutputReader;
    this.digestRules = this.mod.digestRulesReader;
    for (let i = 1; i <= 60; i++) {
      this.rt.push(i);
    }
    this.fileDownloader = this._fh.saveFile;
    this.regexFilter = this.swathHelper.regexFilter;
  }

  ngOnInit() {
    // this._fh.setMitmLocation('https://jimmywarting.github.io/StreamSaver.js/mitm.html');
    this._fh.setMitmLocation(location.protocol + '//' +
      window.location.host +
      //'schulzlab.glycoproteo.me' +
      '/assets/StreamSaver.js/mitm.html');
    this._fh.mitmLocation();
    console.log(this._fh.checkSaveStreamSupport());
    this.mod.getAssets('assets/new_mods.json').subscribe((resp) => {
      this.mod.updateMods(resp.body['data']);
    });
    this.mod.getAssets('assets/windows.json').subscribe((resp) => {
      this.mod.updateWindows(resp.body['data']);
    });
    this.mod.getAssets('assets/oxonium_ions.json').subscribe((resp) => {
      this.mod.updateOxonium(resp.body['data']);
    });
    this.mod.getAssets('assets/digest_rules.json').subscribe((resp) => {
      this.mod.updateDigestRules(resp.body['data']);
    });
    this.errSub = this.anSer.errorReader.subscribe((data) => {
      if (data) {
        this.anSer.Announce('Error.');
        this.collectTrigger = false;
      }
    });
    this.outputSubscription = this.resultReader.subscribe((data) => {
      if (this.collectTrigger) {
        this.resultCollection.push(data);
        this.anSer.Announce(`Processed ${this.resultCollection.length} of ${this.acceptedProtein.length}`);
        if (this.resultCollection.length === this.acceptedProtein.length) {
          this.finishedTime = this.getCurrentDate();
          this.finished = true;
          this.collectTrigger = false;
          this.anSer.Announce('All results have been collected.');
        }
      }
    });
    this.uniprotSub = this.uniprot.UniprotResult.subscribe((data) => {
      const resultMap = new Map<string, string>();
      if (data.DataFrame) {
        const seqColumn = data.DataFrame.columnMap.get('Sequence');
        const idColumn = data.DataFrame.columnMap.get('Entry');
        for (const r of data.DataFrame.data) {
          this.uniprotMap.get(r.row[idColumn]).sequence = r.row[seqColumn];
        }
      }
    });
  }

  ngOnDestroy() {
    this.outputSubscription.unsubscribe();
    this.errSub.unsubscribe();
    this.uniprotSub.unsubscribe();
  }

  createForm() {
    this.form = this.fb.group({
      'static': [],
      'variable': [],
      'ytype': [],
      'rt': [],
      'windows': [],
      'oxonium': [],
      'extra-mass': 0,
      'precursor-charge': 2,
      'max-charge': 2,
      'ion-type': '',
      'variable-bracket-format': 'windows'
    });
  }

  applyModification() {
    console.log(this.form.value);
    this.passForm = Object.create(this.form);
    this.fastaFile.UpdateFastaSource(new FastaFile(this.fastaContent.name, this.acceptedProtein));
  }

  ngAfterViewInit() {

  }

  getCurrentDate() {
    return Date.now();
  }

  handleFile(e) {
    if (e.target) {
      this.file = e;
      this.fileName = e.target.files[0].name;
    }
  }

  async loadFasta(e) {
    if (e) {
      this.fastaContent = await this.ff(e);
    }
  }

  private updateContent() {
    this.passForm = Object.create(this.form);
    const accept = [];
    for (const i of this.fastaContent.content) {
      if (this.digestMap[i.unique_id].accept) {
        if (i.sequence !== '') {
          accept.push(i);
        }
      }
    }
    this.acceptedProtein = accept;
    this.fastaFile.UpdateFastaSource(new FastaFile(this.fastaContent.name, accept));
  }

  SendQueries() {
    this.finished = false;
    this.collectTrigger = true;
    this.queryCollection = [];
    this.resultCollection = [];
    this.anSer.Announce('Queries submitted. Waiting for processing...');
    this.srs.UpdateSendTrigger(true);
  }

  downloadFile() {
    let count = 0;
    if (this._fh.checkSaveStreamSupport()) {
      this.anSer.Announce('Starting stream.');
      const fileStream = this._fh.createSaveStream(`${this.fastaContent.name}_library.txt`);
      const writer = fileStream.getWriter();
      const encoder = new TextEncoding.TextEncoder;
      let writeHeader = false;
      for (const r of this.resultCollection) {
        count++;
        if (r.header !== undefined) {
          if (writeHeader === false) {
            const uint8array = encoder.encode(r.header.join('\t') + '\n');
            writer.write(uint8array);
            writeHeader = true;
          }
          if (r.data.constructor === Array) {
            if (r.data.length > 0) {
              for (const row of r.data) {
                if (row.row !== undefined) {
                  const uint8array = encoder.encode(row.row.join('\t') + '\n');
                  writer.write(uint8array);
                }
              }
            }
          }
        }
      }
      writer.close();
    } else {
      this.anSer.Announce('Stream not supported. Fallback to FileSaver.');
      this.findf = new DataStore([], false, `${this.fastaContent.name}_library.txt`);
      for (const r of this.resultCollection) {
        count ++;
        if (r.header !== undefined) {
          if (r.data.constructor === Array) {
            this.findf.header = r.header;
            this.findf.data.extend(r.data);
          }
        }
        this.anSer.Announce(`Compiled ${count} of ${this.resultCollection.length}`);
      }
      this.anSer.Announce(`Compiled ${count} of ${this.resultCollection.length}`);
      const txtResult = DataStore.toCSV(this.findf.header, this.findf.data, this.findf.fileName, this.findf.fileName);
      this._fh.saveFile(txtResult.content, txtResult.fileName);
    }
    this.anSer.Announce('Finished.');
  }

  rounding(n: number): number {
    return Math.round(n * 10000) / 10000;
  }

  async processFastaContent() {
    console.log('started');
    if (this.fastaRaw !== '') {
      this.fastaContent = await this.fastaFile.readRawFasta(this.fastaRaw);
      // this.passForm = Object.create(this.form);
      // this.fastaFile.UpdateFastaSource(Object.create(this.fastaContent));
    } else {
      await this.loadFasta(this.file);
    }
    this.digestMap = {};
    for (const f of this.fastaContent.content) {
      this.digestMap[f.unique_id] = {autoCleave: false, misCleave: '', rules: {}, accept: true};
    }

    this.acceptTrack = this.fastaContent.content.length;
    this.modalService.open(this.trypticDigest, {size: 'lg'});
    // this.updateContent();
  }

  acceptContent() {
    this.updateContent();
    this.modalService.dismissAll();
  }

  digest(protein: Protein) {
    const digestMap = this.swathHelper.mapDigestRule(this.digestMap[protein.unique_id].rules);
    const a = this.digestMap[protein.unique_id].misCleave.split(',');
    const numa = [];
    for (const n of a) {
      numa.push(parseInt(n, 10) - 1);
    }
    const positionMap = protein.Digest(digestMap, numa);
    const p = Array.from(positionMap.keys());
    console.log(p);
    let sequences = [];
    if (p.length > 0) {
      if (this.digestMap[protein.unique_id].autoCleave) {
        if (p.length > 1) {
          for (let i = 0; i <= p.length; i ++) {
            const res1 = [];
            let nTrue = 0;
            while (nTrue < p.length - i) {
              res1.push(true);
              nTrue ++;
            }

            let nFalse = p.length;
            while (nFalse > p.length - i) {
              res1.push(false);
              nFalse --;
            }
            if (nTrue === p.length || nFalse === 0) {
              sequences = this.getCleavedSeq(p, positionMap, res1, protein, sequences);
            } else {
              const perm = this.swathHelper.permutations(res1);
              for (const i3 of perm) {
                const combination = JSON.parse(i3);
                sequences = this.getCleavedSeq(p, positionMap, combination, protein, sequences);
                // console.log(sequences);
              }
            }
          }
        } else {
          sequences = this.getCleavedSeq(p, positionMap, [true], protein, sequences);
          sequences = this.getCleavedSeq(p, positionMap, [false], protein, sequences);
        }
      } else {
        const c = [];
        for (const b of p) {
          c.push(true);
        }
        sequences = this.getCleavedSeq(p, positionMap, c, protein, sequences);
      }
      // console.log(sequences);
      this.tempFastaContent = new FastaFile(this.fastaContent.name, this.fastaContent.content.slice());
      const newContent = [];
      for (let i = 0; i < this.fastaContent.content.length; i ++) {
        if (this.fastaContent.content[i].unique_id !== protein.unique_id) {
          newContent.push(this.fastaContent.content[i]);
        } else {
          for (let i2 = 0; i2 < sequences.length; i2 ++) {
            const coord = JSON.parse(sequences[i2]);
            const pr = new Protein(protein.id,
              this.fastaContent.content[i].sequence.slice(coord[0], coord[1]), new Map<string, Modification>());
            if (this.fastaContent.content[i].metadata !== undefined) {
              pr.metadata = {};
              pr.metadata.original = this.fastaContent.content[i].metadata.original;
              pr.metadata.originalStart = this.fastaContent.content[i].metadata.originalStart + coord[0];
              pr.metadata.originalEnd = this.fastaContent.content[i].metadata.originalStart + coord[1];
              pr.id = pr.id + '_' + (pr.metadata.originalStart + 1) + '_' + pr.metadata.originalEnd;
            } else {
              pr.metadata = {original: this.fastaContent.content[i], originalStart: coord[0], originalEnd: coord[1]};
              pr.id = pr.id + '_' + (pr.metadata.originalStart + 1) + '_' + pr.metadata.originalEnd;
            }
            pr.unique_id = protein.unique_id + '_' + (i2 + 1);
            pr.original = false;
            newContent.push(pr);
          }
        }
      }
      this.fastaContent.content = newContent;
      const dm = {};
      this.acceptTrack = 0;
      for (const f of this.fastaContent.content) {
        if (this.digestMap[f.unique_id]) {
          dm[f.unique_id] = this.digestMap[f.unique_id];
        } else {
          dm[f.unique_id] = {autoCleave: false, misCleave: '', rules: {}, accept: true};
        }
        if (dm[f.unique_id].accept) {
          this.acceptTrack ++;
        }
      }
      this.digestMap = dm;
    }

  }

  getCleavedSeq(position, positionMap, combination, protein, sequences?) {
    let currentPos = 0;
    if (sequences === undefined) {
      sequences = [];
    }

    for (let i = 0; i < position.length; i ++) {
      if (combination[i]) {
        switch (positionMap.get(position[i])) {
          case 'N':
            if (position[i] > 0) {
              const s = JSON.stringify([currentPos, position[i]]);
              if (!sequences.includes(s)) {
                sequences.push();
              }
              currentPos = position[i];
            }
            break;
          case 'C':
            if (position[i] < protein.sequence.length - 1) {
              const s = JSON.stringify([currentPos, position[i] + 1]);
              if (!sequences.includes(s)) {
                sequences.push(s);
              }
              currentPos = position[i] + 1;
            }
            console.log(sequences);
            break;
        }
      }
    }
    const p = protein.sequence.slice(currentPos);
    if (p !== '') {
      const s = JSON.stringify([currentPos, protein.sequence.length]);
      if (!sequences.includes(s)) {
        sequences.push(s);
      }
    }
    return sequences;
  }

  changeAllBox() {
    this.currentAllBoxes = !this.currentAllBoxes;
    for (const b of Object.keys(this.digestMap)) {
      if (this.digestMap[b]) {
        if (this.digestMap[b]['accept'] !== this.currentAllBoxes) {
          if (this.digestMap[b].accept) {
            this.acceptTrack --;
          } else {
            this.acceptTrack ++;
          }
        }
        this.digestMap[b]['accept'] = this.currentAllBoxes;
      }
    }
  }

  exportFasta() {
    let txtContent = '';
    for (const i of this.fastaContent.content) {
      if (this.digestMap[i.unique_id].accept) {
        txtContent += i.ToFasta();
      }
    }
    this._fh.saveFile(new Blob([txtContent], {'type': 'text/plain;charset=utf-8;'}), this.fastaContent.name);
  }

  fetchUniprot() {
    const allId = [];
    this.uniprotMap = new Map<string, Protein>();
    for (let i = 0; i < this.fastaContent.content.length; i ++) {
      console.log('fetching ' + this.fastaContent.content[i].id);
      if (this.digestMap[this.fastaContent.content[i].unique_id].accept) {
        const accession = this.uniprot.Re.exec(this.fastaContent.content[i].id.toUpperCase());
        if (accession !== null) {
          allId.push(accession[0]);
          this.uniprotMap.set(accession[0], this.fastaContent.content[i]);
        }
      }
    }
    if (allId.length > 0) {
      this.uniprot.UniProtParseGet(allId, false);
    }
  }

  filterSeq() {
    if (this.filterChoice !== undefined) {
      for (let i = 0; i < this.fastaContent.content.length; i ++) {
        if (this.digestMap[this.fastaContent.content[i].unique_id].accept) {
          if (this.fastaContent.content[i].metadata) {
            if (this.fastaContent.content[i].metadata.originalEnd + this.filterChoice.offset < this.fastaContent.content[i].metadata.original.sequence.length) {
              this.digestMap[this.fastaContent.content[i].unique_id].accept = !!this.filterChoice.pattern.test(this.fastaContent.content[i].metadata.original.sequence.slice(this.fastaContent.content[i].metadata.originalStart, this.fastaContent.content[i].metadata.originalEnd + this.filterChoice.offset));
              if (!this.digestMap[this.fastaContent.content[i].unique_id].accept) {
                this.acceptTrack--;
              }
            } else {
              this.digestMap[this.fastaContent.content[i].unique_id].accept = !!this.filterChoice.pattern.test(this.fastaContent.content[i].sequence);
              if (!this.digestMap[this.fastaContent.content[i].unique_id].accept) {
                this.acceptTrack --;
              }
            }
          } else {
            this.digestMap[this.fastaContent.content[i].unique_id].accept = !!this.filterChoice.pattern.test(this.fastaContent.content[i].sequence);
            if (!this.digestMap[this.fastaContent.content[i].unique_id].accept) {
              this.acceptTrack --;
            }
          }
        }
      }
    }
  }

  changeAccept(id) {
    if (this.digestMap[id].accept) {
      this.acceptTrack ++;
    } else {
      this.acceptTrack --;
    }
  }

  UpdateRT(e: number[]) {
    this.rt = e;
    console.log(e);
  }
}
