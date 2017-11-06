export class DataRow {
  row: string[];

  constructor(row: string[]) {
    this.row = row;
  }

  hasSequon(ncol: number): boolean {
    return /N[^XP][S|T]/.test(this.row[ncol]);
  }

  hasSequonNoMod(ncol: number): boolean {
    let noMod = this.remMod(ncol);
    return /N[^XP][S|T]/.test(noMod)
  }

  remMod(ncol: number): string {
    return this.row[ncol].replace(/\[\w+\]/ig, "")
  }
}

export class DataStore {
  header: string[];
  data: DataRow[];
  seqColumn: number;
  fileName: string;
  constructor(data: DataRow[], loadHeader: boolean, fileName: string) {
    this.fileName = fileName;
    if (data.length>1) {
      if (loadHeader) {
        this.header = data[0].row;
        this.data = data.slice(1);
      } else {
        this.data = data
      }
    } else {
      this.data = data
    }
}

  static filterSequon(ignoreMod: boolean, data: DataRow[], seqColumn: number): DataRow[] {
    let d: DataRow[] = [];
    for (let row of data) {
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
    return d
  }

  static toCSV(header: string[], data: DataRow[]): string {
    let csvContent = "";
    csvContent += header.join("\t") + "\n";
    for (let row of data) {
      csvContent += row.row.join("\t") + "\n";
    }
    let blob = new Blob([csvContent], {"type": 'text/csv;charset=utf-8;'});
    return URL.createObjectURL(blob);
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
