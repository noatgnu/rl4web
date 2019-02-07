export class GppQuery {
  reps = [];
  conds = [];
  constructor(protein: string, repsMap, condsMap, maxSites: number, minimumArea: number, glycans, aggregation) {
    this.protein = protein;
    this.repsMap = repsMap;
    this.condsMap = condsMap;
    this.maxSites = maxSites;
    this.minimumArea = minimumArea;
    this.glycans = glycans;
    this.aggregation = aggregation;
  }
  protein: string;
  repsMap;
  condsMap;
  maxSites: number;
  minimumArea: number;
  glycans;
  aggregation;
}
