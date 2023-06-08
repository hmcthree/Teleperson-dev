import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorChairComponent } from './vendor-chair.component';

describe('VendorChairComponent', () => {
  let component: VendorChairComponent;
  let fixture: ComponentFixture<VendorChairComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VendorChairComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorChairComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
