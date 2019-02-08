import { Component, OnInit } from '@angular/core';
import {FastaFileService} from '../helper/fasta-file.service';
import {FastaFile} from '../helper/fasta-file';
import {GlycanProfilerService} from '../helper/glycan-profiler.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {GppExp} from '../helper/gpp-exp';
import {GppQuery} from '../helper/gpp-query';
import {Observable} from 'rxjs';
import {GppResult} from '../helper/gpp-result';

@Component({
  selector: 'app-glycan-position-profiler',
  templateUrl: './glycan-position-profiler.component.html',
  styleUrls: ['./glycan-position-profiler.component.scss'],
  providers: [FastaFileService, GlycanProfilerService]
})
export class GlycanPositionProfilerComponent implements OnInit {
  formData: FormData;
  seq: File;
  alignment: File;
  form: FormGroup;
  fileNames = [];
  fileAttSuf = ['-target', '-rep', '-cond'];
  valueMap: Map<string, string>;
  expNames = [];
  expMap: Map<string, GppExp> = new Map();
  queries: GppQuery[] = [];
  result: Observable<GppResult[]>;
  finishedTime;
  constructor(private fastaService: FastaFileService, private gpp: GlycanProfilerService, private fb: FormBuilder) {
    this.result = this.gpp.resultReader;
  }

  ngOnInit() {
    this.createForm();
  }

  fileChange(e) {
    const fileList: FileList = e.target.files;
    if (fileList.length > 0) {
      this.formData = new FormData();
      for (let i = 0; i < fileList.length; i++) {
        this.formData.append('files', fileList[i], fileList[i].name);
        this.fileNames.push(fileList[i].name);
      }
    }
  }

  loadFasta(e) {
    if (e.target.files.length > 0) {
      this.seq = e.target.files[0];
    }
  }

  loadAlignment(e) {
    if (e.target.files.length > 0) {
      this.alignment = e.target.files[0];
    }
  }

  upload() {
    this.formData.set('fasta', this.seq, this.seq.name);
    if (this.alignment !== undefined) {
      this.formData.append('alignment', this.alignment, this.alignment.name);
    }
    this.formData.set('boilerplate', new Blob([JSON.stringify(this.queries)], {type: 'application/json'}));
    this.gpp.postFormData(this.formData).subscribe((data) => {
      console.log(data.body['data']);
      this.finishedTime = this.getCurrentDate();
      this.gpp.updateResult(data.body['data']);
    });
  }

  genExp() {
    console.log('Generate Boilerplate.');
    this.expMap = this.getLabel();
    this.expNames = Array.from(this.expMap.keys());
    this.queries = [];
    for (const e of this.expNames) {
      const g = this.expMap.get(e);
      const q = new GppQuery(e, {}, {}, this.form.value['maxSites'], this.form.value['minimumArea'], this.form.value['glycans'], this.form.value['aggregation']);
      for (const fn of g.fileNames) {
        if (g.repMap.has(fn) && g.condMap.has(fn)) {
          q.repsMap[fn] = g.repMap.get(fn);
          q.condsMap[fn] = g.condMap.get(fn);
          if (!q.reps.includes(g.repMap.get(fn))) {
            q.reps.push(g.repMap.get(fn));
          }
          if (!q.conds.includes(g.condMap.get(fn))) {
            q.conds.push(g.condMap.get(fn));
          }
        }
      }
      this.queries.push(q);
    }
  }

  getLabel(): Map<string, GppExp> {
    const valueMap = new Map<string, string>();
    const targetMap = new Map<string, GppExp>();
    for (const name of this.fileNames) {
      for (const suf of this.fileAttSuf) {
        const e = <HTMLInputElement>document.getElementById(name + suf);
        if (e !== null) {
          valueMap.set(name + suf, e.value);
          if (suf === '-target') {
            if (e.value !== null && e.value !== '') {
              const targets = e.value.split(',');
              for (const t of targets) {
                if (!targetMap.has(t)) {

                  const gpp = new GppExp([], t, new Map(), new Map(), [], []);
                  targetMap.set(t, gpp);
                }
                const g = targetMap.get(t);
                g.fileNames.push(name);
                targetMap.set(t, g);
              }
            }
          }
        }
      }
    }
    for (const t of Array.from(targetMap.keys())) {
      const g = targetMap.get(t);
      for (const name of g.fileNames) {
        for (const suf of this.fileAttSuf) {
          if (valueMap.has(name + suf) && valueMap.get(name + suf) !== '') {
            switch (suf) {
              case '-rep':
                if (!g.reps.includes(valueMap.get(name + suf))) {
                  g.reps.push(valueMap.get(name + suf));
                }
                g.repMap.set(name, valueMap.get(name + suf));
                break;
              case '-cond':
                if (!g.conds.includes(valueMap.get(name + suf))) {
                  g.conds.push(valueMap.get(name + suf));
                }
                g.condMap.set(name, valueMap.get(name + suf));
                break;
            }
          }
        }
      }
      targetMap.set(t, g);
    }
    return targetMap;
  }

  setLabel(valueMap: Map<string, string>) {
    for (const name of Array.from(valueMap.keys())) {
      const e = <HTMLInputElement>document.getElementById(name);
      if (e !== null) {
        e.value = valueMap.get(name);
      }
    }
  }

  genValueMap() {
    this.valueMap = new Map<string, string>();
    const reps = this.form.value['reps'].split(',');
    const cond = this.form.value['conds'].split(',');
    for (const name of this.fileNames) {
      for (const r of reps) {
        if (name.includes(r)) {
          this.valueMap.set(name + '-rep', r);
        }
      }
      for (const c of cond) {
        if (name.includes(c)) {
          this.valueMap.set(name + '-cond', c);
        }
      }
      this.valueMap.set(name + '-target', this.form.value['targets']);
    }
    this.setLabel(this.valueMap);
  }

  createForm() {
    this.form = this.fb.group({
      'reps': '',
      'conds': '',
      'targets': '',
      'minimumArea': 10 ** 7,
      'maxSites': 2,
      'separate-h': false,
      'glycans': [],
      'aggregation': []
    });
  }

  getCurrentDate() {
    return Date.now();
  }

  inputFileLabel(f: File) {
    if (f) {
      return f.name;
    } else {
      return 'Select File';
    }
  }
}
