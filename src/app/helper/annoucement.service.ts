import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Injectable()
export class AnnoucementService {
  private _annoucementSource = new BehaviorSubject<string>('Welcome');
  annoucementReader = this._annoucementSource.asObservable();
  constructor() { }

  Announce(data: string) {
    this._annoucementSource.next(data);
  }
}
