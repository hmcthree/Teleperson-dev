import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorLoungeComponent } from './vendor-lounge.component';

describe('VendorLoungeComponent', () => {
  let component: VendorLoungeComponent;
  let fixture: ComponentFixture<VendorLoungeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorLoungeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorLoungeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
