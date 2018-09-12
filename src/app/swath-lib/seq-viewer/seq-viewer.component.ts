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
      this.prepareAnnotation(this.data, this.x, this.y, this.gridSize, this.maxColumn);
      this.drawSeq(this.seqBlock, this.x, this.y, this.gridSize, this.maxColumn, this.d3Annotate, this.d3, this.annotationType);
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
    this.annotationType = this.d3Annotate.annotationCustomType(this.d3Annotate.annotationLabel,
      {'className': 'custom', 'connector': {'end': 'dot'},
        'note': {'align': 'dynamic',
            'lineType': 'horizontal'}
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
    this.prepareAnnotation(this.data, x, y, gridSize, this.maxColumn);
    this.drawSeq(this.seqBlock, this.x, this.y, this.gridSize, this.maxColumn, this.d3Annotate, d3, this.annotationType);
    // svg.selectAll('g.annotation-connector, g.annotation-note').style('opacity', 0);
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
      const graphAnnotations = svg.append('g').attr('class', 'annotation-group').call(makeAnnotations);
    }
  }

  private drawSeq(seqBlock, x, y, gridSize: number, columnNumber, d3Annotation, d3, annotationType) {
    seqBlock.selectAll('*').remove();
    const aas = seqBlock.selectAll('.aa').data(this.data);
    aas.exit().remove();
    const aaBlock = aas.enter().append('g');
    const aaTextBlock = aaBlock.append('g').attr('class', 'aa');
    aaBlock.each(function (d, i, n) {
      const annotation = d3.select(n[i]).append('g').attr('class', 'annotation-group')
        .call(d3Annotation
          .annotation()
          .editMode(false)
          .type(annotationType)
          /*.accessors({
            x: d => x(d.column + 1) + gridSize / 2,
            y: d => y(d.row * maxColumn) + gridSize + gridSize / 2,
          })*/
          .annotations([d.annotation]));
      annotation.selectAll('g.annotation-connector, g.annotation-note').style('opacity', 0);
    });

    aaTextBlock.append('rect')
      .attr('class', function (d) {
        return d.aa.modType;
      }).attr('x', function (d) {
        return x(d.column + 1) - gridSize / 2;
      }).attr('y', function (d) {
        return y(d.row * columnNumber) + gridSize / 2;
      }).attr('rx', 2).attr('ry', 2)
      .attr('height', gridSize).attr('width', gridSize)
    ;
    const aaText = aaTextBlock.append('text').attr('class', function (d) {
      return 'aaId ' + d.aa.modType;
    }).attr('x', function (d) {
      return x(d.column + 1);
    }).attr('y', function (d) {
      return y(d.row * columnNumber) + gridSize;
    }).text(function (d) {
      return d.aa.aa;
    });

    aaTextBlock.on('mouseover', function (d) {
      const current = d3.select(d3.event.currentTarget.parentNode);
      console.log(current);
      current.selectAll('g.annotation-connector, g.annotation-note').style('opacity', 1);
    }).on('mouseout', function (d) {
      const current = d3.select(d3.event.currentTarget.parentNode);
      current.selectAll('g.annotation-connector, g.annotation-note').style('opacity', 0);
    });


    console.log(aaBlock);

    /*const annotation = aaBlock.append('g').attr('class', 'annotation-group')
      .call(function (d, i) {
        console.log(i);
        return d3Annotation
          .annotation()
          .editMode(true)
          .type(d3Annotation.annotationLabel).annotations([d.annotation]);
      });
    console.log(aaBlock);*/
    /*aaBlock.on('mouseover', function (d) {
      tooltips.transition().duration(200).style('opacity', 0.9);
      tooltips.html('Position:' + d.aa.coordinate).style('left', (d3.event.pageX) + 'px').style('top', (d3.event.pageY) + 'px');
    }).on('mouseout', function (d) {
      tooltips.style('opacity', 0);
      d3Annotation
        .annotation()
        .editMode(true)
        .type(d3Annotation.annotationLabel).accessors({
        x: d => x(d.column + 1) + gridSize / 2,
        y: d => y(d.row ) + gridSize + gridSize / 2,
          dx: gridSize * xMod,
          dy: gridSize * 2 * yMod,
      })
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
    for (let i = 0; i < data.length; i ++ ) {
      // if (d.aa.modType !== '') {
        let xMod = 1;
        const yMod = 1;
        if ((data[i].aa.coordinate - data[i].row * maxColumn) > 11) {
          xMod = -1;
        }
      data[i].annotation['x'] = x(data[i].column + 1) + gridSize / 2;
      data[i].annotation['y'] = y(data[i].row * maxColumn) + gridSize + gridSize / 2;
      data[i].annotation['dx'] = gridSize * xMod;
      data[i].annotation['dy'] = gridSize * 2 * yMod;
        /*annotations.push({
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
        });*/
      // }
    }
    return annotations;
  }

}
