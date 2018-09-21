import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceHeatmapComponent } from './sequence-heatmap.component';

describe('SequenceHeatmapComponent', () => {
  let component: SequenceHeatmapComponent;
  let fixture: ComponentFixture<SequenceHeatmapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SequenceHeatmapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SequenceHeatmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
