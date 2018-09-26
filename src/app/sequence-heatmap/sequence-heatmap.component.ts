import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {D3, D3Service} from 'd3-ng2-service';
import {GraphService} from '../helper/graph.service';
import {SvgAnnotationService} from '../helper/svg-annotation.service';

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
    console.log(value.length);
    this.SeqNumber = value.number;
    this.ids = value.ids;
    this.features = value.features;
    this.alignmentGapColor = value.alignmentGapColor;
    if (this.svg !== undefined) {
      this.svg.selectAll('*').remove();
      this.d3.select(this.parentNativeElement).selectAll('svg').remove();
      const frame = this.getDrawArea(this.gridSizeVertical);
      console.log(frame);
      this.svg = this.d3.select(this.parentNativeElement).append('svg').attr('width', frame.width).attr('height', frame.height);
      this.draw(this.drawArea, this.margin, this.gridSizeVertical, this.alignmentGapColor);
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
  margin = {left: 200, right: 100, top: 100, bottom: 100};
  gridSizeVertical = 20;
  features;
  d3Annotate;
  annotationType;
  alignmentGapColor;
  constructor(element: ElementRef, private d3service: D3Service, private graph: GraphService, private annotation: SvgAnnotationService) {
    this.d3 = d3service.getD3();
    this.parentNativeElement = element.nativeElement;
    this.d3Annotate = annotation.GetD3Annotation();
    this.annotationType = this.d3Annotate.annotationCustomType(this.d3Annotate.annotationLabel,
      {connector: {end: 'dot'},
        note:
          {
            lineType: 'horizontal',
          },
        className: 'show-bg',
      });
  }

  ngOnInit() {
    const gridSizeVertical = 20;
    const frame = this.getDrawArea(gridSizeVertical);
    this.svg = this.d3.select(this.parentNativeElement).append('svg').attr('width', frame.width).attr('height', frame.height)
      // .attr('width', drawArea.width + margin.left + margin.right)
      // .attr('height', drawArea.height + margin.top + margin.bottom)
      // .attr('viewBox', '0 0 ' + (drawArea.width + margin.left + margin.right) + ' ' + (drawArea.height + margin.top + margin.bottom))
    ;
    this.draw(this.drawArea, this.margin, this.gridSizeVertical, this.alignmentGapColor);
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

  private draw(drawArea, margin, gridSizeVertical: number, alignmentGapColor) {
    const x = this.d3.scaleBand().range([0, drawArea.width]).domain(this.d3.range(1, this.SeqLength + 1).map(function (d) {
      return (d).toString();
    }));
    console.log(x.domain());
    const y = this.d3.scaleBand().range([drawArea.height, 0]).domain(this.ids);
    if (this.features.length > 0) {
      y.padding(0.7);
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
    const xRange = this.d3.range(1, this.SeqLength + 1, 200);
    if (xRange[-1] !== this.SeqLength) {
      xRange.push(this.SeqLength);
    }
    const xAxis = this.d3.axisTop(x).scale(x).tickValues(xRange.map(function (d) {
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
      console.log(d.start, x((d.start + 1).toString()), x.bandwidth() * (d.end - d.start), d.position.length);
      return x((d.start + 1).toString());
    }).attr('y', function (d) {
      return y(d.seq);
    }).attr('width', function (d) {
      // console.log(x.bandwidth() * (d.end - d.start), d.start, d.end);
      return x.bandwidth() * (d.end - d.start);
    }).attr('height', y.bandwidth()).style('fill', function (d) {
      if (d.gap) {
        if (alignmentGapColor.highlight) {
          return alignmentGapColor.color || 'Silver';
        } else {
          return colorScale.colorSc(
            colorScale.colorInterpolate(d.value)
          );
        }
      } else {
        return colorScale.colorSc(
          colorScale.colorInterpolate(d.value)
        );
      }
    })
      /*.style('stroke', function (d) {
      if (d.gap) {
        if (alignmentGapColor.highlight) {
          return alignmentGapColor.color || 'Silver';
        } else {
          return colorScale.colorSc(
            colorScale.colorInterpolate(d.value)
          );
        }
      } else {
        return colorScale.colorSc(
          colorScale.colorInterpolate(d.value)
        );
      }
    })*/
    ;
    this.blockOpacity(aa, this.d3);
    if (this.features) {
      const featuresDrawLocation = graphBlock.append('g').attr('class', 'featureLocation');
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
      this.addFeatureAnnotation(featureBlock, this.d3, this.d3Annotate, this.annotationType, x, y, gridSizeVertical, drawArea, this.SeqLength);
      this.annotationInteraction(feature, this.d3);
    }
  }

  private addFeatureAnnotation(featureBlock, d3, d3Annotation, annotationType, x, y, gridSizeVertical, drawArea, seqLength) {
    featureBlock.each(function (d, i, n) {
      let align = 'dynamic';
      let modifier = 1;
      if (d.start > seqLength / 2) {
        align = 'right';
        modifier = -1;
      }
      const annotation = d3.select(n[i]).append('g').attr('class', 'annotation-group').style('font-size', '12px')
        .call(d3Annotation
          .annotation()
          .editMode(false)
          .type(annotationType)
          .annotations([
            {
              note: {
                label: 'Start: ' + d.start + ';\n' + 'Stop: ' + d.stop,
                title: d.title,
                wrapSplitter: /\n/,
                align: align,
                bgPadding: 10
              },
              x: x(d.start.toString()),
              y: drawArea.height - y(d.entry) + gridSizeVertical / 2,
              dx: gridSizeVertical / 5 * modifier,
              dy: gridSizeVertical * 1.5,
              // color: '#E8336D',
              color: d.color,
            }
          ]));
      annotation.selectAll('g.annotation-connector, g.annotation-note').classed('hidden', true);
    });
  }
  private annotationInteraction(feature, d3) {
    feature.on('mouseover', function (d) {
      const current = d3.select(d3.event.currentTarget.parentNode);
      current.selectAll('g.annotation-connector, g.annotation-note').classed('hidden', false);
    }).on('mouseout', function (d) {
      const current = d3.select(d3.event.currentTarget.parentNode);
      current.selectAll('g.annotation-connector, g.annotation-note').classed('hidden', true);
    });
  }

  private blockOpacity(aa, d3) {
    aa.on('mouseover', function (d) {
      const selected = d3.select(d3.event.currentTarget);
      selected.transition().duration(500).style('opacity', 0.75);
    }).on('mouseout', function (d) {
      const selected = d3.select(d3.event.currentTarget);
      selected.transition().duration(500).style('opacity', 1);
    });
  }
}
