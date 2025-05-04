import { TestBed } from '@angular/core/testing';

import { ModifyContestService } from './modify-contest.service';

describe('ModifyContestService', () => {
  let service: ModifyContestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModifyContestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
