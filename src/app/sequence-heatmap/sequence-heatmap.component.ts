import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {D3, D3Service} from 'd3-ng2-service';
import {GraphService} from '../helper/graph.service';

@Component({
  selector: 'app-sequence-heatmap',
  templateUrl: './sequence-heatmap.component.html',
  styleUrls: ['./sequence-heatmap.component.scss']
})
export class SequenceHeatmapComponent implements OnInit {
  private _scores: any[];
  @Input() set scores(value) {
    this._scores = value.data;
    this.SeqLength = value.length;
    this.SeqNumber = value.number;
    console.log(value);
    if (this.svg !== undefined) {
      this.svg.selectAll('*').remove();
      this.d3.select(this.parentNativeElement).selectAll('svg').remove();
      const frame = this.getDrawArea(this.gridSizeVertical);
      console.log(frame);
      this.svg = this.d3.select(this.parentNativeElement).append('svg').attr('width', frame.width).attr('height', frame.height)
      // .attr('width', drawArea.width + margin.left + margin.right)
      // .attr('height', drawArea.height + margin.top + margin.bottom)
      // .attr('viewBox', '0 0 ' + (drawArea.width + margin.left + margin.right) + ' ' + (drawArea.height + margin.top + margin.bottom))
      ;
      this.draw(this.drawArea, this.margin, this.gridSizeVertical);
    }
  }
  SeqLength: number;
  SeqNumber: number;
  colors = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'];
  svg;
  d3: D3;
  parentNativeElement;
  drawArea;
  margin = {left: 10, right: 10, top: 10, bottom: 100};
  gridSizeVertical = 20;
  constructor(element: ElementRef, private d3service: D3Service, private graph: GraphService) {
    this.d3 = d3service.getD3();
    this.parentNativeElement = element.nativeElement;
  }

  ngOnInit() {
    const gridSizeVertical = 20;
    const frame = this.getDrawArea(gridSizeVertical);
    this.svg = this.d3.select(this.parentNativeElement).append('svg').attr('width', frame.width).attr('height', frame.height)
      // .attr('width', drawArea.width + margin.left + margin.right)
      // .attr('height', drawArea.height + margin.top + margin.bottom)
      // .attr('viewBox', '0 0 ' + (drawArea.width + margin.left + margin.right) + ' ' + (drawArea.height + margin.top + margin.bottom))
    ;
    this.draw(this.drawArea, this.margin, this.gridSizeVertical);
  }

  private getDrawArea(gridSizeVertical: number) {
    const frame = {width: 1280, height: 100 + gridSizeVertical * (this.SeqNumber) + 100 * this.SeqNumber};
    // const drawArea = {width: gridSize * this.SeqLength, height: this.SeqNumber * 40};

    this.drawArea = {
      width: frame.width - this.margin.left - this.margin.right,
      height: frame.height - this.margin.top - this.margin.bottom
    };
    return frame;
  }

  private draw(drawArea, margin, gridSizeVertical: number) {
    const x = this.d3.scaleBand().range([0, drawArea.width]).domain(this.d3.range(0, this.SeqLength).map(function (d) {
      return d.toString();
    }));
    const y = this.d3.scaleLinear().range([drawArea.height, 0]).domain([0, this.SeqNumber]);
    const graphBlock = this.svg.append('g').attr('transform', 'translate(' + margin.left + ' ' + margin.top + ')').attr('class', 'drawArea');
    const gradient = this.graph.CreateColorGradient(this.svg, this.colors);
    const legend = this.graph.CreateColorsGradientLegend(
      this.svg,
      (drawArea.width + margin.left + margin.right) / 2,
      drawArea.height + margin.top,
      this.d3,
      200,
      20,
      gradient.name,
      [0, 1]);
    const colorScale = this.graph.CreateColorScale(this.d3, this.colors, [0, 1.0]);
    const aaDrawLocation = graphBlock.append('g').attr('class', 'aaLocation');
    const aaBlock = aaDrawLocation.selectAll('g').data(this._scores).enter().append('g').attr('class', 'aaBlock');
    const aa = aaBlock.append('rect').attr('x', function (d) {
      return x((d.position).toString());
    }).attr('y', function (d) {
      return drawArea.height - y(d.seq);
    }).attr('width', x.bandwidth()).attr('height', gridSizeVertical).style('fill', function (d) {
      return colorScale.colorSc(colorScale.colorInterpolate(d.value));
    });
  }
}
