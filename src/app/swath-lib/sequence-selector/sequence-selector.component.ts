import { Component, OnInit, Input } from '@angular/core';
import {Protein} from "../../helper/protein";
import {SeqCoordinate} from "../../helper/seq-coordinate";
import {Modification} from "../../helper/modification";

@Component({
  selector: 'app-sequence-selector',
  templateUrl: './sequence-selector.component.html',
  styleUrls: ['./sequence-selector.component.css']
})
export class SequenceSelectorComponent implements OnInit {
  @Input('protein') protein: Protein;
  @Input('variable_mods') variable_mods: Map<string, Modification>;
  @Input('static_mods') static_mods: Map<string, Modification>;
  @Input('y_mods') y_mods: Map<string, Modification[]>;
  seqCoord: SeqCoordinate[] = [];
  constructor() {

  }

  ngOnInit() {
    this.transformSequence();
  }

  transformSequence() {
    for (let i = 0; i < this.protein.sequence.length; i++) {
      const s = new SeqCoordinate(this.protein.sequence[i], i, '', []);
      this.seqCoord.push(s);
    }
  }
}
