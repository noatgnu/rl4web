import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcellularLocationComponent } from './subcellular-location.component';

describe('SubcellularLocationComponent', () => {
  let component: SubcellularLocationComponent;
  let fixture: ComponentFixture<SubcellularLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubcellularLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcellularLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
