import {Modification} from "./modification";

export class Protein {
  constructor(id: string, sequence: string, modifications: Map<string, Modification>) {
    this._id = id;
    this._sequence = sequence;
    this._modifications = modifications;
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
}
