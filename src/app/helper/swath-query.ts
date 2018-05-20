import {Protein} from "./protein";
import {Modification} from "./modification";
import {SwathWindows} from "./swath-windows";

export class SwathQuery {
  constructor(protein: Protein, modifications: Modification[], windows: SwathWindows[], rt: Array<number>) {
    this._protein = protein;
    this._modifications = modifications;
    this._windows = windows;
    this._rt = rt;
  }
  get windows(): SwathWindows[] {
    return this._windows;
  }

  set windows(value: SwathWindows[]) {
    this._windows = value;
  }

  get rt(): Array<number> {
    return this._rt;
  }

  set rt(value: Array<number>) {
    this._rt = value;
  }

  get protein(): Protein {
    return this._protein;
  }

  set protein(value: Protein) {
    this._protein = value;
  }

  get modifications(): Modification[] {
    return this._modifications;
  }

  set modifications(value: Modification[]) {
    this._modifications = value;
  }
  private _protein: Protein;
  private _modifications: Modification[];
  private _windows: SwathWindows[];
  private _rt: Array<number>;
}
