import { TestBed } from '@angular/core/testing';
import { OverlayService } from './overlay-service';

describe('OverlayService', () => {
  let service: OverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OverlayService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show overlay when show is called', (done) => {
    service.show();
    service.loading$.subscribe((loading) => {
      expect(loading).toBe(true);
      done();
    });
  });

  it('should hide overlay when hide is called', (done) => {
    service.show();
    service.hide();
    service.loading$.subscribe((loading) => {
      expect(loading).toBe(false);
      done();
    });
  });

  it('should handle multiple concurrent requests', (done) => {
    service.show();
    service.show();
    service.loading$.subscribe((loading) => {
      expect(loading).toBe(true);
    });

    service.hide();
    service.loading$.subscribe((loading) => {
      expect(loading).toBe(true);
    });

    service.hide();
    service.loading$.subscribe((loading) => {
      expect(loading).toBe(false);
      done();
    });
  });

  it('should force hide overlay', (done) => {
    service.show();
    service.show();
    service.forceHide();
    service.loading$.subscribe((loading) => {
      expect(loading).toBe(false);
      done();
    });
  });
});
