export class Publication {
  constructor(title: string, link: string, year: number, refFormat: string) {
    this.title = title;
    this.link = link;
    this.year = year;
    this.refFormat = refFormat;
  }
  title: string;
  link: string;
  year: number;
  refFormat: string;
}

export class RefData {
  category: string;
  data: Publication[];

  constructor(category: string, data: Publication[]) {
    this.category = category;
    this.data = data;
  }

}
