import { TestBed } from '@angular/core/testing';

import { ActivityMonitorService } from './activity-monitor-service';

describe('ActivityMonitorService', () => {
  let service: ActivityMonitorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivityMonitorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
