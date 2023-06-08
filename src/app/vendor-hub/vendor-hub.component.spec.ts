import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorHubComponent } from './vendor-hub.component';

describe('VendorHubComponent', () => {
  let component: VendorHubComponent;
  let fixture: ComponentFixture<VendorHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorHubComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
