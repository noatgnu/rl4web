

export class DataRow {
  row: string[];

  constructor(row: string[]) {
    this.row = row;
  }

  hasSequon(ncol: number): boolean {
    return /N[^XP][S|T]/.test(this.row[ncol]);
  }

  hasSequonNoMod(ncol: number): boolean {
    const noMod = this.remMod(ncol);
    return /N[^XP][S|T]/.test(noMod);
  }

  remMod(ncol: number): string {
    return this.row[ncol].replace(/\[\w+\]/ig, '');
  }

  hasMod(ncol: number, modList: string[]) {
    let score = 0;
    for (const mod of modList) {
      if (this.row[ncol].includes(mod)) {
        score += 1;
      }
    }
    return score === modList.length;
  }
}

export class DataStore {
  header: string[];
  data: DataRow[];
  seqColumn: number;
  modColumn: number;
  fileName: string;
  constructor(data: DataRow[], loadHeader: boolean, fileName: string) {
    this.fileName = fileName;
    if (data.length > 1) {
      if (loadHeader) {
        this.header = data[0].row;
        this.data = data.slice(1);
      } else {
        this.data = data;
      }
    } else {
      this.data = data;
    }
}

  static filterSequon(ignoreMod: boolean, data: DataRow[], seqColumn: number): DataRow[] {
    const d: DataRow[] = [];
    for (const row of data) {
      if (ignoreMod) {
        if (row.hasSequonNoMod(seqColumn)) {
          d.push(row);
        }
      } else {
        if (row.hasSequon(seqColumn)) {
          d.push(row);
        }
      }
    }
    return d;
  }

  static filterMod(modList: string[], modColumn: number, data: DataRow[]): DataRow[][] {
    const y: DataRow[] = [];
    const n: DataRow[] = [];
    for (const row of data) {
      if (row.hasMod(modColumn, modList)) {
        y.push(row);
      } else {
        n.push(row);
      }
    }
    return [y, n];
  }

  static toCSV(header: string[], data: DataRow[], fileName: string, jobName: string): Result {
    let csvContent = '';
    csvContent += header.join('\t') + '\n';
    for (const row of data) {
      csvContent += row.row.join('\t') + '\n';
    }
    return new Result(fileName, new Blob([csvContent], {'type': 'text/csv;charset=utf-8;'}), jobName, data.length);
    /*if (navigator.msSaveBlob) {
      navigator.msSaveBlob(blob, newName);
    } else {
      let link = document.createElement("a");
      if (link.download !== undefined) {
        let linkText = document.createTextNode("Result");
        link.appendChild(linkText);
        link.href = URL.createObjectURL(blob);
        link.download = newName;
        return link
      }
    }*/
  }
}

export class Result {
  jobName: string;
  fileName: string;
  content: Blob;
  length: number;

  constructor(fileName: string, content: Blob, jobName: string, length: number) {
    this.jobName = jobName;
    this.fileName = fileName;
    this.content = content;
    this.length = length;
  }
}
