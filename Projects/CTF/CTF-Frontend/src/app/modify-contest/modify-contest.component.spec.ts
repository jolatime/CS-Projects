import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyContestComponent } from './modify-contest.component';

describe('ModifyContestComponent', () => {
  let component: ModifyContestComponent;
  let fixture: ComponentFixture<ModifyContestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyContestComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyContestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
