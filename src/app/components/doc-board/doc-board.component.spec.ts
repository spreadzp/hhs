import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocBoardComponent } from './doc-board.component';

describe('DocBoardComponent', () => {
  let component: DocBoardComponent;
  let fixture: ComponentFixture<DocBoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocBoardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
