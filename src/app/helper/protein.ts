import {Modification} from "./modification";

export class Protein {
  get extra(): number {
    return this._extra;
  }

  set extra(value: number) {
    this._extra = value;
  }
  get ion_type(): string {
    return this._ion_type;
  }

  set ion_type(value: string) {
    this._ion_type = value;
  }
  constructor(id: string, sequence: string, modifications: Map<string, Modification>) {
    this._id = id;
    this._sequence = sequence;
    this._modifications = modifications;
    this.ion_type = '';
    this.extra = 0;
  }
  get id(): string {
    return this._id;
  }

  set id(value: string) {
    this._id = value;
  }

  get sequence(): string {
    return this._sequence;
  }

  set sequence(value: string) {
    this._sequence = value;
  }

  get modifications(): Map<string, Modification> {
    return this._modifications;
  }

  set modifications(value: Map<string, Modification>) {
    this._modifications = value;
  }
  private _id: string;
  private _sequence: string;
  private _modifications: Map<string, Modification>;
  private _ion_type: string;
  private _extra: number;
}
