import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherVendorsComponent } from './other-vendors.component';

describe('OtherVendorsComponent', () => {
  let component: OtherVendorsComponent;
  let fixture: ComponentFixture<OtherVendorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherVendorsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherVendorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
