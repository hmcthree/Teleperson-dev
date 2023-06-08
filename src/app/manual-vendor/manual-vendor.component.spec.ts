import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualVendorComponent } from './manual-vendor.component';

describe('ManualVendorComponent', () => {
  let component: ManualVendorComponent;
  let fixture: ComponentFixture<ManualVendorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManualVendorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualVendorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
