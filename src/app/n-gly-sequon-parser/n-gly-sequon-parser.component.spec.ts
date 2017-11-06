import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NGlySequonParserComponent } from './n-gly-sequon-parser.component';

describe('NGlySequonParserComponent', () => {
  let component: NGlySequonParserComponent;
  let fixture: ComponentFixture<NGlySequonParserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NGlySequonParserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NGlySequonParserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
