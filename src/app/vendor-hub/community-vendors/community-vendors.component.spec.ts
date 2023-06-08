import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityVendorsComponent } from './community-vendors.component';

describe('CommunityVendorsComponent', () => {
  let component: CommunityVendorsComponent;
  let fixture: ComponentFixture<CommunityVendorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommunityVendorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommunityVendorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
