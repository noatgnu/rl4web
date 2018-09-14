import { Injectable } from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SwathLibHelperService {
  private _changeSource = new Subject<boolean>();
  changeObservable = this._changeSource.asObservable();
  private _selectedSource = new Subject<number[]>();
  selectedObservable = this._selectedSource.asObservable();
  SequenceMap: Map<string, any> = new Map();

  constructor() { }

  AddMap(id) {
    const changeSource = new Subject<boolean>();
    const selectedSource = new Subject<number[]>();
    this.SequenceMap.set(id, {change: changeSource, selected: selectedSource});
  }
  Selected(id, data) {
    this.SequenceMap.get(id).selected.next(data);
  }

  Change(id, data) {
    this.SequenceMap.get(id).change.next(data);
  }
}
