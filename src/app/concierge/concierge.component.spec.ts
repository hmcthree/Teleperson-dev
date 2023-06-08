import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConciergeComponent } from './concierge.component';

describe('ConciergeComponent', () => {
  let component: ConciergeComponent;
  let fixture: ComponentFixture<ConciergeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConciergeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConciergeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
