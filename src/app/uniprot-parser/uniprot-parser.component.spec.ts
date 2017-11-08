import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UniprotParserComponent } from './uniprot-parser.component';

describe('UniprotParserComponent', () => {
  let component: UniprotParserComponent;
  let fixture: ComponentFixture<UniprotParserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UniprotParserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UniprotParserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
