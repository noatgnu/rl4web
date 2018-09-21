import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SequenceVisualizerComponent } from './sequence-visualizer.component';

describe('SequenceVisualizerComponent', () => {
  let component: SequenceVisualizerComponent;
  let fixture: ComponentFixture<SequenceVisualizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SequenceVisualizerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SequenceVisualizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
