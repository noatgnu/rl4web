import { Component, OnInit } from '@angular/core';
import {FileHandlerService} from '../file-handler.service';
import {DataRow, DataStore} from '../data-row';
import {CommonRegex} from '../common-regex';
import {NgForm} from '@angular/forms';
import {GraphData} from '../helper/graph-data';

@Component({
  selector: 'app-subcellular-location',
  templateUrl: './subcellular-location.component.html',
  styleUrls: ['./subcellular-location.component.scss']
})
export class SubcellularLocationComponent implements OnInit {
  private ProteinInfo: DataStore;
  private Peptide: DataStore;
  selected = ['Endoplasmic reticulum', 'Golgi', 'Vacuole', 'Mitochondrion', 'membrane'];
  topdom = 'Endoplasmic reticulum,Golgi,Vacuole,Mitochondrion,membrane';
  ProteinEntryColumn: number;
  ProteinEntryColumnName = 'Entry';
  PeptideEntryColumn: number;
  PeptideEntryColumnName = 'Entry';
  SubcellColumnName = 'Subcellular Location [CC]';
  regex = new CommonRegex();
  graphData: GraphData[] = [];
  result: Map<string, DataRow[]>;
  constructor(private _fh: FileHandlerService) {

  }

  ngOnInit() {
  }

  async loadFile(event, file) {
    switch (file) {
      case 'protein':
        this.ProteinInfo = await this._fh.fileHandler(event, true);
        break;
      case 'peptide':
        this.Peptide = await this._fh.fileHandler(event, true);
        break;
    }
  }

  getSubMap(info: DataStore, selected: string[], entryColumn: number, subColumn: number): Map<string, Map<string, DataRow>> {
    const mm: Map<string, Map<string, DataRow>> = new Map<string, Map<string, DataRow>>();
    for (const row of info.data) {
      const lowCol = row.row[subColumn].toLowerCase();
      for (const i of selected) {
        const low = i.toLowerCase();
        if (lowCol.includes(low)) {
          let m: Map<string, DataRow>;
          if (mm.has(i)) {
            m = mm.get(i);
          } else {
            m = new Map<string, DataRow>();
          }
          const acc = this.getAcc(row.row[entryColumn]);
          if (acc !== undefined) {
            m.set(acc, row);
            mm.set(i, m);
          }
          break;
        }
      }
    }
    return mm;
  }

  checkSubMap(peptide: DataStore, selected: string[], subMap: Map<string, Map<string, DataRow>>, entryColumn: number): Map<string, DataRow[]> {
    const checked: Map<string, DataRow[]> = new Map<string, DataRow[]>();
    for (const row of peptide.data) {
      for (const i of selected) {
        if (subMap.has(i)) {
          const m = subMap.get(i);
          const acc = this.getAcc(row.row[entryColumn]);
          if (acc !== undefined) {
            if (m.has(acc)) {
              if (checked.has(i)) {
                checked.get(i).push(row);
              } else {
                const d: DataRow[] = [];
                d.push(row);
                checked.set(i, d);
              }
              break;
            }
          }
        }
      }
    }
    return checked;
  }

  GetAccColumn(df: DataStore): number {
    if (df.data.length > 0) {
      for (let i = 0; i < df.data[0].row.length; i++) {
        if (this.regex.uniProt.exec(df.data[0].row[i]) !== null) {
          return i;
        }
      }
    }
  }

  onSubmit(f: NgForm) {
    if (f.valid) {
      if (this.ProteinEntryColumnName !== '') {
        this.ProteinEntryColumn = DataStore.getColumnNum(this.ProteinInfo.header, this.ProteinEntryColumnName);
      } else {
        this.ProteinEntryColumn = this.GetAccColumn(this.ProteinInfo);
      }
      if (this.PeptideEntryColumnName !== '') {
        this.PeptideEntryColumn = DataStore.getColumnNum(this.Peptide.header, this.PeptideEntryColumnName);
      } else {
        this.PeptideEntryColumn = this.GetAccColumn(this.Peptide);
      }
      const subColumn = DataStore.getColumnNum(this.ProteinInfo.header, this.SubcellColumnName);
      const selected = this.topdom.split(',');
      const sm = this.getSubMap(this.ProteinInfo, selected, this.ProteinEntryColumn, subColumn);
      this.result = this.checkSubMap(this.Peptide, selected, sm, this.PeptideEntryColumn);
      this.graphData = [];
      for (const s of selected) {
        if (this.result.has(s)) {
          this.graphData.push(new GraphData(s, this.result.get(s).length));
        } else {
          this.graphData.push(new GraphData(s, 0));
        }
      }
    }
  }

  getAcc(s: string): string {
    const acc = this.regex.uniProt.exec(s);
    if (acc !== null) {
      return acc[0];
    }
  }

  downloadFile(name: string) {
    const data = DataStore.toCSV(this.Peptide.header, this.result.get(name), name + '.txt', name);
    this._fh.saveFile(data.content, data.fileName);
  }
}
