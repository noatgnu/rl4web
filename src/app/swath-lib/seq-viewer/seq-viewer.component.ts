import {Component, ElementRef, Input, OnInit, AfterViewInit, OnChanges} from '@angular/core';
import {D3Service, D3} from 'd3-ng2-service';
import {SeqCoordinate} from '../../helper/seq-coordinate';
import {SvgAnnotationService} from '../../helper/svg-annotation.service';

@Component({
  selector: 'app-seq-viewer',
  templateUrl: './seq-viewer.component.html',
  styleUrls: ['./seq-viewer.component.scss']
})
export class SeqViewerComponent implements OnInit {
  private _Seq: SeqCoordinate[];
  gridSize = 20;
  @Input() maxColumn: number;
  @Input()
    set Seq(value: SeqCoordinate[]) {
    this._Seq = value;
    const result = this.distributeRow(value, this.maxColumn, this.gridSize);
    this.data = result.data;
    this.maxRowNumber = result.maxRowNumber;
    if (this.seqBlock !== undefined) {
      this.drawSeq(this.seqBlock, this.x, this.y, this.gridSize, this.maxColumn, this.d3Annotate);
    }
  }
  get Seq(): SeqCoordinate[] {
    return this._Seq;
  }
  data;
  parentNativeElement: any;
  d3: D3;
  maxRowNumber: number;
  x;
  y;
  seqBlock;
  tooltips;
  d3Annotate;
  svg;
  annotationType;
  constructor(element: ElementRef, private d3Service: D3Service, private annotation: SvgAnnotationService) {
    this.parentNativeElement = element.nativeElement;
    this.d3 = d3Service.getD3();
    this.d3Annotate = annotation.GetD3Annotation();
    this.annotationType = this.d3Annotate.annotationCustomType(this.d3Annotate.annotationCalloutCircle,
      {'className': 'custom', // 'connector': {'end': 'dot'},
        // 'note': {'align': 'dynamic',
            // 'lineType': 'horizontal'}
        });
  }

  ngOnInit() {
    const gridSize = this.gridSize;
    const frame = {width: 640, height: 25 + gridSize + gridSize * (this.maxRowNumber + 5)};
    const margin = {top: 20, right: 10, bottom: 5, left: 40};
    const d3 = this.d3;
    let svg: any;
    const width = frame.width - margin.left - margin.right;
    const height = frame.height - margin.top - margin.bottom;
    const seqHeight = height - gridSize * 3;
    const x = d3.scaleLinear().range([0, width]).domain([0, this.maxColumn]);
    const y = d3.scaleLinear().range([0, seqHeight]).domain([0, (this.maxRowNumber + 1) * this.maxColumn ]);
    const xAxis = d3.axisTop(x).scale(x).tickValues(d3.range(1, this.maxColumn + 1, 1));
    const yTicks = d3.range(0, (this.maxRowNumber + 2) * this.maxColumn, this.maxColumn);
    const yAxis = d3.axisLeft(y).scale(y)
      // .ticks(this.maxRowNumber + 1)
      .tickValues(yTicks);
    svg = d3.select(this.parentNativeElement).append('svg')
      .attr('viewBox', '0 0 ' + frame.width + ' ' + frame.height);
    this.svg = svg;
    const graphBlock = svg.append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    const xaxis = graphBlock.append('g')
      .attr('class', 'top-axis')
      .call(xAxis);
    const yaxis = graphBlock
      .append('g')
      .attr('class', 'left-axis')
      .attr('transform', 'translate(0,' + gridSize + ')')
      .call(yAxis);
    this.x = x;
    this.y = y;
    const seqBlock = graphBlock.append('g').attr('class', 'seqBlock');
    this.seqBlock = seqBlock;
    const getAnnotations = this.prepareAnnotation(this.data, x, y, gridSize, this.maxColumn);
    this.drawSeq(this.seqBlock, this.x, this.y, this.gridSize, this.maxColumn, this.d3Annotate);
  }

  private drawAnnotation(x, y, gridSize, svg: any, data, annotationType, maxColumn) {
    const getAnnotations = this.prepareAnnotation(data, x, y, gridSize, maxColumn);
    if (getAnnotations.length > 0) {
      const makeAnnotations = this.d3Annotate.annotation().editMode(true).type(annotationType)
        .annotations(getAnnotations)
        .on('subjectover', function(annotation) {
        annotation.type.a.selectAll('g.annotation-connector, g.annotation-note').style('opacity', 1);
      }).on('subjectout', function(annotation) {
        annotation.type.a.selectAll('g.annotation-connector, g.annotation-note').style('opacity', 0);
        });
      console.log(makeAnnotations.collection());
      const graphAnnotations = svg.append('g').attr('class', 'annotation-group').call(makeAnnotations);
      svg.selectAll('g.annotation-connector, g.annotation-note').style('opacity', 0);
      console.log(graphAnnotations);
    }
  }

  private drawSeq(seqBlock, x, y, gridSize: number, columnNumber, d3Annotation) {
    seqBlock.selectAll('*').remove();
    const aas = seqBlock.selectAll('.aa').data(this.data);
    aas.exit().remove();
    const aaBlock = aas.enter().append('g').attr('class', 'aa');
    aaBlock.append('rect')
      .attr('class', function (d) {
        return d.aa.modType;
      }).attr('x', function (d) {
        return x(d.column + 1) - gridSize / 2;
      }).attr('y', function (d) {
        return y(d.row * columnNumber) + gridSize / 2;
      }).attr('rx', 2).attr('ry', 2)
      .attr('height', gridSize).attr('width', gridSize)
    ;
    const aaText = aaBlock.append('text').attr('class', function (d) {
      return 'aaId ' + d.aa.modType;
    }).attr('x', function (d) {
      return x(d.column + 1);
    }).attr('y', function (d) {
      return y(d.row * columnNumber) + gridSize;
    }).text(function (d) {
      return d.aa.aa;
    });

    aaBlock.append('g').attr('class', 'annotation-group')
      .call(function (d) {
        
      return d3Annotation
        .annotation()
        .editMode(true)
        .type(d3Annotation.annotationLabel).accessors({
        x: d => x(d.column + 1) + gridSize / 2,
        y: d => y(d.row ) + gridSize + gridSize / 2,
          dx: gridSize * xMod,
          dy: gridSize * 2 * yMod,
      })
    })
    /*aaBlock.on('mouseover', function (d) {
      tooltips.transition().duration(200).style('opacity', 0.9);
      tooltips.html('Position:' + d.aa.coordinate).style('left', (d3.event.pageX) + 'px').style('top', (d3.event.pageY) + 'px');
    }).on('mouseout', function (d) {
      tooltips.style('opacity', 0);
    });*/
  }

  distributeRow(seqCoord: SeqCoordinate[], maxColumn: number, gridSize) {
    const data = [];
    let rowNumber = 0;
    let columnNumber = 0;
    for (let i = 0; i < seqCoord.length; i++) {
      if (i % maxColumn === 0 && i !== 0) {
        rowNumber ++;
        columnNumber = 0;
      }
      data.push(
        {column: columnNumber,
          row: rowNumber,
          aa: seqCoord[i],
          annotation: {
            note: {
              label: seqCoord[i].modType,
              title: (seqCoord[i].coordinate + 1) + seqCoord[i].aa,
              align: 'dynamics',
              lineType: 'horizontal'
            },
            // x: x(d.column + 1) + gridSize / 2,
            // y: y(d.row * maxColumn) + gridSize + gridSize / 2,

            data: {column: columnNumber, row: rowNumber},
            color: '#E8336D',
            className: 'show-bg',
            subject: {
              radius: 5,
              // radiusPadding: 10
            },
          }
        });
      columnNumber ++;
    }
    return {data: data, maxRowNumber: rowNumber};
  }

  prepareAnnotation(data, x, y, gridSize, maxColumn) {
    const annotations = [];
    for (const d of data) {
      // if (d.aa.modType !== '') {
        let xMod = 1;
        const yMod = 1;
        if (d.aa.coordinate > 10) {
          xMod = -1;
        }
        annotations.push({
          note: {
            label: d.aa.modType,
            title: (d.aa.coordinate + 1) + d.aa.aa,
            align: 'dynamics',
            lineType: 'horizontal'
          },
          x: x(d.column + 1) + gridSize / 2,
          y: y(d.row * maxColumn) + gridSize + gridSize / 2,
          dx: gridSize * xMod,
          dy: gridSize * 2 * yMod,
          data: {column: d.column, row: d.row},
          color: '#E8336D',
          className: 'show-bg',

          subject: {
            radius: 5,
            // radiusPadding: 10
          },
        });
      // }
    }
    return annotations;
  }
}
