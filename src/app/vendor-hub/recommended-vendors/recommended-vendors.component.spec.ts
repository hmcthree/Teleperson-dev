import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecommendedVendorsComponent } from './recommended-vendors.component';

describe('RecommendedVendorsComponent', () => {
  let component: RecommendedVendorsComponent;
  let fixture: ComponentFixture<RecommendedVendorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecommendedVendorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecommendedVendorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
