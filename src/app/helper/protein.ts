import {Modification} from "./modification";

export class Protein {
  get unique_id(): string {
    return this._unique_id;
  }

  set unique_id(value: string) {
    this._unique_id = value;
  }

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
  private _unique_id: string;

  Digest(ruleMap: Map<string, number[]>, misCleave: number[]) {
    const positionMap = new Map<number, number[]>();
    for (let i = 0; i < this.sequence.length; i++) {
      if (ruleMap.has(this.sequence[i])) {
        if (!positionMap.has(i)) {
          positionMap.set(i, []);
        }
        for (const n of ruleMap.get(this.sequence[i])) {
          positionMap.get(i).push(i + n);
        }
      }
    }
    const a = Array.from(positionMap.keys());
    return this.RecursiveDigest(a, positionMap, 0, 0, this.sequence, []);
  }

  RecursiveDigest(positionArray, positionMap, positionNumber, previous, sequence, result) {
    for (const p of positionMap.get(positionArray[positionNumber])) {
      const fragment = sequence.slice(previous, p);
      if (fragment !== '') {
        result.push(fragment);
      }
      if (positionNumber + 1 < positionArray.length) {
        result = this.RecursiveDigest(positionArray, positionMap, positionNumber + 1, p, sequence, result);
      }
    }
    return result;
  }
}
