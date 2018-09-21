import { Component, OnInit } from '@angular/core';
import {FastaFile} from '../helper/fasta-file';
import {FastaFileService} from '../helper/fasta-file.service';
import {Subject} from "rxjs";

@Component({
  selector: 'app-sequence-visualizer',
  templateUrl: './sequence-visualizer.component.html',
  styleUrls: ['./sequence-visualizer.component.scss'],
  providers: [FastaFileService]
})
export class SequenceVisualizerComponent implements OnInit {
  fastaRaw = '';
  fastaContent: FastaFile;
  scores = [];
  windows = 10;
  private result = new Subject<any>();
  resultObserve = this.result.asObservable();
  constructor(private fastaFile: FastaFileService) { }

  ngOnInit() {
  }

  async submit() {
    this.scores = [];
    this.fastaContent = await this.fastaFile.readRawFasta(this.fastaRaw);
    for (let f = 0; f < this.fastaContent.content.length; f ++) {
      const reg = new RegExp('N[^XP][T|S]', 'g');
      let match = reg.exec(this.fastaContent.content[f].sequence);
      const mods = [];
      while (match != null) {
        mods.push(match.index);
        match = reg.exec(this.fastaContent.content[f].sequence);
      }
      this.scores = this.fastaFile.CalculateScore(this.windows, this.fastaContent.content[f].sequence, mods, f, this.scores);
    }
    console.log(this.scores);
    this.result.next({data: this.scores, length: this.fastaContent.content[0].sequence.length, number: this.fastaContent.content.length});
  }
}

