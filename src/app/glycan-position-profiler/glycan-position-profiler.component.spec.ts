import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlycanPositionProfilerComponent } from './glycan-position-profiler.component';

describe('GlycanPositionProfilerComponent', () => {
  let component: GlycanPositionProfilerComponent;
  let fixture: ComponentFixture<GlycanPositionProfilerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlycanPositionProfilerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlycanPositionProfilerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
