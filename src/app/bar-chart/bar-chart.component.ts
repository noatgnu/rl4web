import {Component, OnInit, Input, AfterViewInit, ElementRef, ViewChild} from '@angular/core';
import {GraphData} from '../helper/graph-data';
import {D3Service, D3, ScaleLinear, Selection, Transition, Axis} from 'd3-ng2-service';
import {NgbTooltip, NgbTooltipConfig} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css']
})
export class BarChartComponent implements OnInit, AfterViewInit {
  @Input() data: GraphData[];
  @Input() GridSize: number;
  private d3: D3;
  private parentNativeElement: any;
  private d3Svg: Selection<SVGSVGElement, any, null, undefined>;

  constructor(element: ElementRef, d3Service: D3Service, config: NgbTooltipConfig) {
    this.d3 = d3Service.getD3();
    this.parentNativeElement = element.nativeElement;
    config.placement = 'top';
    config.triggers = 'hover';
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    const frame = {width: 640, height: 400};
    const margin = {top: 20, right: 20, bottom: 30, left: 40};
    const d3 = this.d3;
    let svg: any;
    const gridSize = this.GridSize;
    const width = frame.width - margin.left - margin.right;
    const height = frame.height - margin.top - margin.bottom;

    const y = d3.scaleLinear().range([height, 0]).domain([0, d3.max(this.data, function (d) {
      return d.value;
    })]);
    const x = d3.scaleBand().range([0, width]).paddingInner(0.2)
      .paddingOuter(0.2);
    x.domain(this.data.map(function (d) {return d.name; }));
    const xAxis = d3.axisBottom(x).scale(x);
    svg = d3.select(this.parentNativeElement).append('svg')
      // .attr('width', frame.width)
      // .attr('height', frame.height)
      .attr('viewBox', '0 0 ' + frame.width + ' ' + frame.height);

    const graphBlock = svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    const bars = graphBlock.selectAll('.bars').data(this.data);
    const barBlocks = bars.enter().append('g').attr('class', 'barBlock');
    const bar = barBlocks.append('rect').style('fill', '#E85285')
      .attr('x', function (d) {return x(d.name); }).attr('y', function (d) {
        return  y(d.value);
      }).attr('width', x.bandwidth()).attr('height', y(0)).attr('ngbTooltip', function (d) {
        return d.value;
      });
    bar.append('title').text(function (d) {
      return d.value;
    });
    bar.transition().duration(500).ease(this.d3.easeLinear).attr('height', function(d) {
      return height - y(d.value);
    });
    barBlocks.on('mouseover', this.MouseOver(d3)).on('mouseout', this.MouseOut(d3));

    const xaxis = graphBlock.append('g')
      .attr('class', 'bottom-axis')
      .attr('transform', 'translate(0,' + height + ')').call(xAxis);
    const yaxis = graphBlock.append('g').call(d3.axisLeft(y));
  }

  MouseOver(d3): (d, i) => void {
    return (d, i) => {
      const parent = d3.select(d3.event.currentTarget);
      const bar = parent.select('rect');
      const transOptic = () => {
        bar.transition().duration(500).style('fill-opacity', 0.3).on('end', () => {
          bar.transition().duration(500).style('fill-opacity', 1).on('end', transOptic);
        });
      };
      transOptic();

      /*const fo = parent.append('foreignObject')
        .attr('x', x(d.name))
        .attr('y', height - y(d.value))
        .attr('width', 40)
        .attr('class', 'bsTooltip');
      const tooltip = fo.append('xhtml:div').attr('ngbTooltip', d.value);
      console.log(tooltip);*/
    };
  }

  MouseOut(d3): (d, i) => void {
    return (d, i) => {
      const bar = d3.select(d3.event.currentTarget).select('rect');
      bar.transition().duration(500).style('fill-opacity', 1);
      /*const parent = d3.select(d3.event.currentTarget);
      parent.selectAll('.bsTooltip').remove();*/
    };
  }
}
