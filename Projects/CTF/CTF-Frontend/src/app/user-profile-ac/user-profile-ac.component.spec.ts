import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserProfileACComponent } from './user-profile-ac.component';

describe('UserProfileACComponent', () => {
  let component: UserProfileACComponent;
  let fixture: ComponentFixture<UserProfileACComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileACComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserProfileACComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
