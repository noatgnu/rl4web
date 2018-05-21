import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {Protein} from '../../helper/protein';
import {SeqCoordinate} from '../../helper/seq-coordinate';
import {Modification} from '../../helper/modification';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NgbDropdownConfig, NgbModal, NgbTooltipConfig, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import {SwathLibAssetService} from '../../swath-lib-asset.service';
import {Observable} from 'rxjs/Observable';
import {SwathResultService} from '../../helper/swath-result.service';
import {SwathQuery} from '../../helper/swath-query';
import {Subscription} from 'rxjs/Subscription';
import {DataStore} from '../../data-row';

@Component({
  selector: 'app-sequence-selector',
  templateUrl: './sequence-selector.component.html',
  styleUrls: ['./sequence-selector.component.css'],
  providers: [NgbTooltipConfig, NgbDropdownConfig]
})
export class SequenceSelectorComponent implements OnInit, OnDestroy {
  preMadeForm: FormGroup;
  addModForm: FormGroup;
  staticMods: Observable<Modification[]>;
  variableMods: Observable<Modification[]>;
  Ymods: Observable<Modification[]>;
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
    this.sendTriggerRead = this.srs.sendTriggerReader;
    tooltip.placement = 'top';
    tooltip.triggers = 'hover';
  }

  private _currentCoord: SeqCoordinate;

  ngOnInit() {
    this.SendTriggerSub = this.sendTriggerRead.subscribe((data) => {
      this.sent = false;
      this.progress = 0;
      if (data) {
        this.sent = true;
        this.progress = 20;
        this.summarize();
        this.progress = 40;
        this.srs.SendQuery(new SwathQuery(this.protein, this.modSummary, this.form.value['windows'], this.form.value['rt'], this.form.value['extra-mass'])).subscribe((response) => {
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
          if (this.modMap.has(match.index)) {
            const mM = this.modMap.get(match.index);
            mM.push(m);
            this.modMap.set(match.index, mM);
          } else {
            const n = [];
            n.push(m);
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
            this.modSummary.push(Object.create(m));
            this.modSummary[count].positions = [];
            this.modSummary[count].positions.push(i.coordinate);
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

  createForm(position, aa) {
    this.addModForm = this.fb.group({
      'name': ['', Validators.required],
      'mass': [0, Validators.required],
      'regex': aa,
      'multiple_pattern': 'FALSE',
      'label': [],
      'type': 'static',
      'Ytype': [],
      'status': [],
      'auto_allocation': 'FALSE',
      'positions': [],
    });
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
            m2.status = 'filled';
          }
        }
      }
    } else {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.status = '';
          }
        }
      }
    }
    for (const k of m.positions) {
      for (const m2 of this.seqCoord[k].mods) {
        if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
          m2.status = m.status;
        }
      }
    }
  }

  changePattern(t, m) {
    if (t.checked) {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.multiple_pattern = 'TRUE';
          }
        }
      }
    } else {
      for (const k of m.positions) {
        for (const m2 of this.seqCoord[k].mods) {
          if ((m.name + m.Ytype) === (m2.name + m2.Ytype)) {
            m2.multiple_pattern = 'FALSE';
          }
        }
      }
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
}
