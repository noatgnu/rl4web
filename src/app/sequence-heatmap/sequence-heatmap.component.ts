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
    this.ids = value.ids;
    this.features = value.features;
    console.log(value);
    if (this.svg !== undefined) {
      this.svg.selectAll('*').remove();
      this.d3.select(this.parentNativeElement).selectAll('svg').remove();
      const frame = this.getDrawArea(this.gridSizeVertical);
      console.log(frame);
      this.svg = this.d3.select(this.parentNativeElement).append('svg').attr('width', frame.width).attr('height', frame.height);
      this.draw(this.drawArea, this.margin, this.gridSizeVertical);
    }
  }
  ids: string[];
  SeqLength: number;
  SeqNumber: number;
  colors = ['#ffffd9', '#edf8b1', '#c7e9b4', '#7fcdbb', '#41b6c4', '#1d91c0', '#225ea8', '#253494', '#081d58'].reverse();
  svg;
  d3: D3;
  parentNativeElement;
  drawArea;
  margin = {left: 200, right: 10, top: 100, bottom: 100};
  gridSizeVertical = 20;
  features;
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
    const frame = {width: 960, height: 100 + gridSizeVertical * (this.SeqNumber) + 100 * this.SeqNumber};
    // const drawArea = {width: gridSize * this.SeqLength, height: this.SeqNumber * 40};

    this.drawArea = {
      width: frame.width - this.margin.left - this.margin.right,
      height: frame.height - this.margin.top - this.margin.bottom
    };
    return frame;
  }

  private draw(drawArea, margin, gridSizeVertical: number) {
    const x = this.d3.scaleBand().range([0, drawArea.width]).domain(this.d3.range(0, this.SeqLength + 1).map(function (d) {
      return (d).toString();
    }));
    const y = this.d3.scaleBand().range([drawArea.height, 0]).domain(this.ids);
    if (this.features.length > 0) {
      y.padding(0.5);
    }
    const graphBlock = this.svg.append('g').attr('transform', 'translate(' + margin.left + ' ' + margin.top + ')').attr('class', 'drawArea');
    const gradient = this.graph.CreateColorGradient(this.svg, this.colors);
    const legend = this.graph.CreateColorsGradientLegend(
      this.svg,
      margin.left,
      drawArea.height + margin.top + margin.bottom / 2,
      this.d3,
      drawArea.width,
      20,
      gradient.name,
      [0, 1]);
    const colorScale = this.graph.CreateColorScale(this.d3, this.colors, [0, 1.0]);
    const xAxis = this.d3.axisTop(x).scale(x).tickValues(this.d3.range(1, this.SeqLength + 1, 200).map(function (d) {
      return d.toString();
    }));
    const xAxisBlock = graphBlock.append('g').attr('class', 'top-axis')
      // .attr('transform', 'translate(0,' + -(this.gridSizeVertical / 2 + this.margin.top / 10) + ')')
      .call(xAxis);
    // xAxisBlock.selectAll('path').style('opacity', 0)
    const yAxis = this.d3.axisLeft(y).scale(y);
    const yAxisBlock = graphBlock.append('g').attr('class', 'left-axis').call(yAxis);
    yAxisBlock.selectAll('path').style('opacity', 0);
    const aaDrawLocation = graphBlock.append('g').attr('class', 'aaLocation');
    const aaBlock = aaDrawLocation.selectAll('g').data(this._scores).enter().append('g').attr('class', 'aaBlock');
    const aa = aaBlock.append('rect').attr('x', function (d) {
      return x((d.position[0] + 1).toString());
    }).attr('y', function (d) {
      return y(d.seq);
    }).attr('width', function (d) {
      return x.bandwidth() * (d.end - d.start);
    }).attr('height', y.bandwidth()).style('fill', function (d) {
      return colorScale.colorSc(
       colorScale.colorInterpolate(d.value)
      );
    }).style('stroke', function (d) {
      return colorScale.colorSc(
        colorScale.colorInterpolate(d.value)
      );
    });
    if (this.features) {
      const featuresDrawLocation = graphBlock.append('g').attr('class', 'feautreLocation');
      const featureBlock = featuresDrawLocation.selectAll('g').data(this.features).enter().append('g').attr('class', 'featureBlock');
      const feature = featureBlock.append('rect').attr('x', function (d) {
        return x(d.start.toString());
      }).attr('y', function (d) {
        return drawArea.height - y(d.entry) + gridSizeVertical / 5;
      }).attr('width', function (d) {
        return x.bandwidth() * (parseInt(d.stop, 10) + 1 - parseInt(d.start, 10));
      }).attr('height', gridSizeVertical / 5).style('fill', function (d) {
        return d.color;
      }).style('stroke', function (d) {
        return d.color;
      });
    }
  }
}
