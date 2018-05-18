import { Injectable } from '@angular/core';
import {DataRow, DataStore} from '../data-row';
import {Protein} from './protein';
import {Modification} from './modification';
import {FastaFile} from "./fasta-file";

@Injectable()
export class FastaFileService {

  constructor() { }
  async fileHandler(e) {
    return new Promise<FastaFile>((resolve, reject) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      const result: Protein[] = [];
      let currentP = new Protein('', '', new Map<string, Modification>());
      reader.onload = (event) => {
        const loadedFile = reader.result;

        const lines = loadedFile.split(/\r\n|\n/);
        lines.map((line) => {
          if (line.length > 0) {
            if (line.startsWith('>', 0)) {
              if (currentP.id !== '') {
                result.push(currentP);
                console.log(line.slice(1));
                currentP = new Protein(line.slice(1), '', new Map<string, Modification>());
              } else {
                currentP.id = line.slice(1);
                console.log(currentP);
              }
            } else {
              currentP.sequence += line;
            }
          }
        });

        resolve(new FastaFile(file.name, result));
      };
      reader.readAsText(file);
    });
  }
}
