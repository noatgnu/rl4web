import {Protein} from "./protein";
import {Modification} from "./modification";
import {SwathWindows} from "./swath-windows";

export class SwathQuery {
  constructor(protein: Protein, modifications: Modification[], windows: SwathWindows[], rt: Array<number>, extra: number, charge: number, precursor_charge: number) {
    this._protein = protein;
    this._modifications = modifications;
    this._windows = windows;
    this._rt = rt;
    this._extra = extra;
    this._charge = charge;
    this._precursor_charge = precursor_charge;
  }
  get precursor_charge(): number {
    return this._precursor_charge;
  }

  set precursor_charge(value: number) {
    this._precursor_charge = value;
  }

  get extra(): number {
    return this._extra;
  }

  set extra(value: number) {
    this._extra = value;
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

  get charge(): number {
    return this._charge;
  }

  set charge(value: number) {
    this._charge = value;
  }

  private _protein: Protein;
  private _modifications: Modification[];
  private _windows: SwathWindows[];
  private _rt: Array<number>;
  private _extra: number;
  private _charge: number;
  private _precursor_charge: number;
}
