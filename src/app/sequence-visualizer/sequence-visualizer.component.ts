import { Component, OnInit } from '@angular/core';
import {FastaFile} from '../helper/fasta-file';
import {FastaFileService} from '../helper/fasta-file.service';
import {Subject} from 'rxjs';
import {FileHandlerService} from '../file-handler.service';
import {ExampleService} from "../helper/example.service";
import {SwathLibAssetService} from "../swath-lib-asset.service";

@Component({
  selector: 'app-sequence-visualizer',
  templateUrl: './sequence-visualizer.component.html',
  styleUrls: ['./sequence-visualizer.component.scss'],
  providers: [FastaFileService, FileHandlerService, ExampleService]
})
export class SequenceVisualizerComponent implements OnInit {
  fastaRaw = '';
  fastaContent: FastaFile;
  scores = [];
  windows = 11;
  ids = [];
  private result = new Subject<any>();
  fileE;
  alignmentGapColor = {highlight: false, color: ''};
  resultObserve = this.result.asObservable();
  features = [];
  matchPattern = String.raw`N[^XP]\-*[T|S]`;
  exampleContent = '';
  fastaExample = false;
  constructor(private fastaFile: FastaFileService, private fileHandler: FileHandlerService, private exampleService: ExampleService, private assets: SwathLibAssetService) { }

  ngOnInit() {
  }

  async submit() {
    if ((this.windows % 2) !== 0) {
      this.scores = [];
      this.ids = [];
      this.features = [];
      this.fastaContent = await this.fastaFile.readRawFasta(this.fastaRaw);
      for (let f = 0; f < this.fastaContent.content.length; f ++) {
        const reg = new RegExp(this.matchPattern, 'g');
        let match = reg.exec(this.fastaContent.content[f].sequence);
        const mods = [];
        while (match != null) {
          mods.push(match.index);
          match = reg.exec(this.fastaContent.content[f].sequence);
        }
        this.ids.push(this.fastaContent.content[f].id);
        this.scores = this.fastaFile.CalculateScore(this.windows, this.fastaContent.content[f].sequence, mods, this.fastaContent.content[f].id, this.scores);

      }
      if (this.fileE !== undefined) {
        const featuresDF = await this.fileHandler.fileHandler(this.fileE, true);
        this.mapFeatureToSeq(featuresDF);
      } else if (this.fastaExample === true && this.exampleContent !== '') {
        const featuresDF = await this.fileHandler.fileHandler(this.exampleContent, true);
        this.mapFeatureToSeq(featuresDF);
      }
      this.fastaExample = false;
      this.result.next(
        {
          data: this.scores,
          length: this.fastaContent.content[0].sequence.length,
          number: this.fastaContent.content.length,
          ids: this.ids, features: this.features,
          alignmentGapColor: this.alignmentGapColor
        });
    }
  }

  private mapFeatureToSeq(featuresDF) {
    for (const e of featuresDF.data) {
      if (!featuresDF.columnMap.has('entry')) {
        for (const i of this.ids) {
          this.addFeature(i, e, featuresDF);
        }
      } else {
        if (e.row[featuresDF.columnMap.get('entry')] !== '') {
          for (const i of this.ids) {
            this.addFeature(i, e, featuresDF);
          }
        } else if (this.ids.includes(featuresDF.columnMap.get('entry'))) {
          this.addFeature(this.ids[this.ids.indexOf(featuresDF.columnMap.get('entry'))], e, featuresDF);
        }
      }
    }
  }

  private addFeature(i, e, featuresDF) {
    let color = 'black';
    if (featuresDF.columnMap.has('color')) {
      color = e.row[featuresDF.columnMap.get('color')] || 'black';
    }
    this.features.push({
      entry: i,
      start: e.row[featuresDF.columnMap.get('start')],
      stop: e.row[featuresDF.columnMap.get('stop')],
      title: e.row[featuresDF.columnMap.get('title')],
      color: color,
    });
  }

  async processFeatures() {

  }

  fileEvent(event) {
    this.fileE = event;
  }

  getExampleFeatures() {
    this.assets.getAssets('assets/examples/features.txt', 'text').subscribe((data) => {
      this.exampleContent = data.body.toString();
      console.log(this.exampleContent);
    });
  }

  getExampleAlignment() {
    this.fastaRaw = this.exampleService.fastaAlignment;
    this.fastaExample = true;
  }
}

