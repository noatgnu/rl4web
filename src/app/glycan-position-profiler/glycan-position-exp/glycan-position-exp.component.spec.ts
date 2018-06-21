import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlycanPositionExpComponent } from './glycan-position-exp.component';

describe('GlycanPositionExpComponent', () => {
  let component: GlycanPositionExpComponent;
  let fixture: ComponentFixture<GlycanPositionExpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlycanPositionExpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlycanPositionExpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
