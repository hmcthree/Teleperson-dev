import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YouzakComponent } from './youzak.component';

describe('YouzakComponent', () => {
  let component: YouzakComponent;
  let fixture: ComponentFixture<YouzakComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ YouzakComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(YouzakComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
