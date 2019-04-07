import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavHealthComponent } from './nav-health.component';

describe('NavHealthComponent', () => {
  let component: NavHealthComponent;
  let fixture: ComponentFixture<NavHealthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavHealthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavHealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
