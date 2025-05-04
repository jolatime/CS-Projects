import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UNAUTHORIZEDComponent } from './unauthorized.component';

describe('UNAUTHORIZEDComponent', () => {
  let component: UNAUTHORIZEDComponent;
  let fixture: ComponentFixture<UNAUTHORIZEDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UNAUTHORIZEDComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UNAUTHORIZEDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
