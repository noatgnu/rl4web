import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {Protein} from '../../helper/protein';
import {SeqCoordinate} from '../../helper/seq-coordinate';
import {Modification} from '../../helper/modification';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {
  NgbDropdownConfig,
  NgbModal,
  NgbTooltipConfig,
  ModalDismissReasons,
  NgbModalRef
} from '@ng-bootstrap/ng-bootstrap';
import {SwathLibAssetService} from '../../swath-lib-asset.service';
import {Observable} from 'rxjs/Observable';
import {SwathResultService} from '../../helper/swath-result.service';
import {SwathQuery} from '../../helper/swath-query';
import {Subscription} from 'rxjs/Subscription';
import {DataStore} from '../../data-row';
import {Oxonium} from "../../helper/oxonium";

@Component({
  selector: 'app-sequence-selector',
  templateUrl: './sequence-selector.component.html',
  styleUrls: ['./sequence-selector.component.css'],
  providers: [NgbTooltipConfig, NgbDropdownConfig]
})
export class SequenceSelectorComponent implements OnInit, OnDestroy {
  modalref: NgbModalRef;
  preMadeForm: FormGroup;
  addModForm: FormGroup;
  extraForm: FormGroup;
  staticMods: Observable<Modification[]>;
  variableMods: Observable<Modification[]>;
  Ymods: Observable<Modification[]>;
  oxonium: Observable<Oxonium[]>;
  sent: boolean;
  progress: number;

  get currentCoord(): SeqCoordinate {
    return this._currentCoord;
  }

  set currentCoord(value: SeqCoordinate) {
    this._currentCoord = value;
  }
  get modSummary(): Modification[] {
    return this._modSummary;
  }

  set modSummary(value: Modification[]) {
    this._modSummary = value;
  }
  get protein(): Protein {
    return this._protein;
  }
  @Input()
  set protein(value: Protein) {
    this._protein = value;
  }

  get form(): FormGroup {
    return this._form;
  }
  @Input()
  set form(value: FormGroup) {
    this._form = value;
    this.decorSeq();
    this.createExtraForm();
    this.protein.ion_type = this._form.value['ion-type'];
  }
  private _protein: Protein;
  private _form: FormGroup;

  seqCoord: SeqCoordinate[] = [];
  modMap: Map<number, Modification[]> = new Map<number, Modification[]>();
  private _modSummary: Modification[];
  SendTriggerSub: Subscription;
  sendTriggerRead: Observable<boolean>;
  constructor(private mod: SwathLibAssetService, tooltip: NgbTooltipConfig, dropdown: NgbDropdownConfig, private modalService: NgbModal, private fb: FormBuilder, private srs: SwathResultService) {
    this.staticMods = mod.staticMods;
    this.variableMods = mod.variableMods;
    this.Ymods = mod.YtypeMods;
    this.oxonium = mod.oxoniumReader;
    this.sendTriggerRead = this.srs.sendTriggerReader;

    tooltip.placement = 'top';
    tooltip.triggers = 'hover';
  }

  private _currentCoord: SeqCoordinate;

  ngOnInit() {
    this.createExtraForm();
    this.SendTriggerSub = this.sendTriggerRead.subscribe((data) => {
      this.sent = false;
      this.progress = 0;
      if (data) {
        this.sent = true;
        this.progress = 20;
        this.summarize();
        this.progress = 40;
        const query = new SwathQuery(this.protein, this.modSummary, this.form.value['windows'], this.form.value['rt'], this.form.value['extra-mass'], this.form.value['max-charge'], this.form.value['precursor-charge']);
        query.oxonium = this.extraForm.value['oxonium'];
        this.srs.SendQuery(query).subscribe((response) => {
          this.progress = 60;
          const df = new DataStore(response.body['data'], true, '');
          this.progress = 80;
          this.srs.UpdateOutput(df);
          this.progress = 100;
        });
      }
    });
  }

  ngOnDestroy() {
    this.SendTriggerSub.unsubscribe();
  }

  decorSeq() {
    this.modMap = new Map<number, Modification[]>();
    this.seqCoord = [];
    if (this.form.value['static'] !== null || this.form.value['variable'] !== null || this.form.value['ytype'] !== null) {
      this.applyModification(this.protein);
    }
    this.transformSequence();
  }

  transformSequence() {
    this.modSummary = [];
    this.seqCoord = [];
    for (let i = 0; i < this.protein.sequence.length; i++) {
      const s = new SeqCoordinate(this.protein.sequence[i], i, '', []);
      this.setMod(i, s);
      this.seqCoord.push(s);
    }

    this.summarize();
  }

  private setMod(i: number, s) {
    if (this.modMap !== undefined) {
      if (this.modMap.has(i)) {
        for (const m of this.modMap.get(i)) {
          this.appendMod(s, m);
        }
      }
    }
  }

  private appendMod(s, m) {
    if (s.modType !== m.type) {

      if (s.modType !== '') {
        s.modType = 'conflicted';
      } else {
        s.modType = m.type;
      }
    } else {
      if (s.modType !== 'Ytype') {
        s.modType = 'conflicted';
      }
    }
    s.mods.push(m);
  }

  applyModification(protein: Protein) {
    this.modifySeq(protein, 'static');
    this.modifySeq(protein, 'variable');
    this.modifySeq(protein, 'ytype');
  }

  private modifySeq(f, modCat) {
    if (this.form.value[modCat] !== null) {
      for (const m of this.form.value[modCat]) {
        const reg = new RegExp(m.regex, 'g');
        let match = reg.exec(f.sequence);
        while (match != null) {
          const newMod = Object.create(m);
          for (const key in newMod) {
            newMod[key] = newMod[key];
          }
          if (this.modMap.has(match.index)) {
            const mM = this.modMap.get(match.index);
            mM.push(newMod);

            this.modMap.set(match.index, mM);
          } else {
            const n = [];
            n.push(newMod);
            this.modMap.set(match.index, n);
          }
          match = reg.exec(f.sequence);
        }
      }
    }
  }

  summarize() {
    this.modSummary = [];
    const summaryMap = new Map<string, number>();
    let count = 0;
    for (const i of this.seqCoord) {
      if (i.mods.length > 0) {

        for (const m of i.mods) {
          if (summaryMap.has(m.name + m.Ytype)) {
            const sumIndex = summaryMap.get(m.name + m.Ytype);
            this.modSummary[sumIndex].positions.push(i.coordinate);
          } else {
            const newMod = Object.create(m);
            for (const key in newMod) {
              newMod[key] = newMod[key];
            }
            this.modSummary.push(newMod);
            this.modSummary[count].positions = [];
            this.modSummary[count].positions.push(i.coordinate);
            if (m.status !== false) {
              this.modSummary[count].status = m.status;
            }
            summaryMap.set(m.name + m.Ytype, count);
            count ++;
          }
        }
      }
    }
  }

  selectCoordinates(coordinates: number[]) {
    for (const c of coordinates) {
      const el = this.getElement(this.seqCoord[c].modType + c + this.protein.id + this.protein.sequence);
      el.click();
    }
  }

  getElement(id) {
    return document.getElementById(id);
  }

  clickEvent(t) {
    if (!t.isOpen()) {
      t.toggle();
    }
  }

  contextClick(c) {
    c.open();
    return false;
  }

  openEditModal(modal, position) {
    this.currentCoord = this.seqCoord[position];
    this.modalService.open(modal);
  }

  openProteinEditor(modal) {
    this.modalref = this.modalService.open(modal);
  }

  createForm(position, aa) {
    this.addModForm = this.fb.group({
      'name': ['', Validators.required],
      'mass': [0, Validators.required],
      'regex': aa,
      'multiple_pattern': false,
      'label': [],
      'type': 'static',
      'Ytype': [],
      'status': false,
      'auto_allocation': 'FALSE',
      'positions': [],
    });
  }

  createExtraForm() {
    console.log(this.form.value['oxonium']);
    if (this.form.value['oxonium']) {
      if (this.form.value['oxonium'].length > 0) {
        this.extraForm = this.fb.group({
          'name': '',
          'oxonium': Object.create(this.form.value['oxonium'])
        });
      } else {
        this.extraForm = this.fb.group({
          'name': '',
          'oxonium': []
        });
      }
    } else {
      this.extraForm = this.fb.group({
        'name': '',
        'oxonium': []
      });
    }

  }

  createFormPremade() {
    this.preMadeForm = this.fb.group({
      'static': [],
      'variable': [],
      'ytype': []
    });
  }

  addToCurrent(c) {
    if (c === 'premade') {
      this.helperPremade('static');
      this.helperPremade('variable');
      this.helperPremade('ytype');
    } else {
      this.appendMod(this.currentCoord,
        new Modification(
          [this.currentCoord.coordinate],
          this.addModForm.value['status'],
          this.addModForm.value['multiple_pattern'],
          this.addModForm.value['Ytype'],
          this.addModForm.value['auto_allocation'],
          this.addModForm.value['type'],
          this.addModForm.value['mass'],
          this.addModForm.value['regex'],
          this.addModForm.value['label'],
          this.addModForm.value['name']
          ));
    }
    this.summarize();
  }

  private helperPremade(m) {
    if (this.preMadeForm.value[m] !== null) {
      for (const c of this.preMadeForm.value[m]) {
        this.appendMod(this.currentCoord, Object.create(c));
      }
    }
  }

  changeStatus(t, m) {
    if (t.checked) {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            console.log(this.protein.id);
            m2.status = true;
          }
        }
      }
      m.status = true;
    } else {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.status = false;
          }
        }
      }
      m.status = false;
    }
  }

  changePattern(t, m) {
    if (t.checked) {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.multiple_pattern = true;
          }
        }
      }
      m.multiple_pattern = true;
    } else {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.multiple_pattern = false;
          }
        }
      }
      m.multiple_pattern = false;
    }
  }

  removeModification(m) {
    m.forErase = true;
    let ind = -1;
    for (let i = 0; i < this.currentCoord.mods.length; i++) {
      if (this.currentCoord.mods[i].forErase) {
        ind = i;
        break;
      }
    }
    if (ind !== -1) {
      this.currentCoord.mods.splice(ind, 1);
      let temp = '';
      for (const mod of this.currentCoord.mods) {
        if (temp === '') {
          temp = mod.type;
        } else {
          if (temp === mod.type) {
            if (temp !== 'Ytype') {
              temp = 'conflicted';
              break;
            }
          } else {
            temp = 'conflicted';
            break;
          }
        }
      }
      this.currentCoord.modType = temp;
      this.summarize();
    }
  }

  clearModifications() {
    for (const s of this.seqCoord) {
      s.modType = undefined;
      s.mods = [];
    }
    this.summarize();
  }

  saveProtein() {
    this.protein.id = this.extraForm.value['name'];
    this.modalref.close();
  }
}
