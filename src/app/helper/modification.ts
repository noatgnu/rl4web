export class Modification {
  constructor(positions: Array<number>, status: string, multiple_pattern: string, Ytype: string, auto_allocation: string, type: string, mass: number, regex: string, label: string, name: string) {
    this._positions = positions;
    this._status = status;
    this._multiple_pattern = multiple_pattern;
    this._Ytype = Ytype;
    this._auto_allocation = auto_allocation;
    this._type = type;
    this._mass = mass;
    this._regex = regex;
    this._label = label;
    this._name = name;
  }
  get positions(): Array<number> {
    return this._positions;
  }

  set positions(value: Array<number>) {
    this._positions = value;
  }

  get status(): string {
    return this._status;
  }

  set status(value: string) {
    this._status = value;
  }

  get multiple_pattern(): string {
    return this._multiple_pattern;
  }

  set multiple_pattern(value: string) {
    this._multiple_pattern = value;
  }

  get Ytype(): string {
    return this._Ytype;
  }

  set Ytype(value: string) {
    this._Ytype = value;
  }

  get auto_allocation(): string {
    return this._auto_allocation;
  }

  set auto_allocation(value: string) {
    this._auto_allocation = value;
  }

  get type(): string {
    return this._type;
  }

  set type(value: string) {
    this._type = value;
  }

  get mass(): number {
    return this._mass;
  }

  set mass(value: number) {
    this._mass = value;
  }

  get regex(): string {
    return this._regex;
  }

  set regex(value: string) {
    this._regex = value;
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }
  private _positions: Array<number>;
  private _status: string;
  private _multiple_pattern: string;
  private _Ytype: string;
  private _auto_allocation: string;
  private _type: string;
  private _mass: number;
  private _regex: string;
  private _label: string;
  private _name: string;
}
