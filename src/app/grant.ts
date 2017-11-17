export class Grant {
  constructor(location: string, start: number, end: number, projectTitle: string, link: string, grantTitle: string) {
    this.location = location;
    this.start = start;
    this.end = end;
    this.projectTitle = projectTitle;
    this.link = link;
    this.grantTitle = grantTitle;
  }
  location: string;
  start: number;
  end: number;
  projectTitle: string;
  link: string;
  grantTitle: string;
}
