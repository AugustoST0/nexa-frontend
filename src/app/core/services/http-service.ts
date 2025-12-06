import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, finalize } from 'rxjs';
import { OverlayService } from './overlay-service';

export interface HttpOptions {
  headers?: HttpHeaders | { [header: string]: string | string[] };
  params?: HttpParams | { [param: string]: string | string[] };
  skipOverlay?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private readonly http = inject(HttpClient);
  private readonly overlayService = inject(OverlayService);

  get<T>(url: string, options?: HttpOptions): Observable<T> {
    if (!options?.skipOverlay) {
      this.overlayService.show();
    }
    return this.http.get<T>(url, options).pipe(
      finalize(() => {
        if (!options?.skipOverlay) {
          this.overlayService.hide();
        }
      })
    );
  }

  post<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    if (!options?.skipOverlay) {
      this.overlayService.show();
    }
    return this.http.post<T>(url, body, options).pipe(
      finalize(() => {
        if (!options?.skipOverlay) {
          this.overlayService.hide();
        }
      })
    );
  }

  put<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    this.overlayService.show();
    return this.http.put<T>(url, body, options).pipe(
      finalize(() => this.overlayService.hide())
    );
  }

  patch<T>(url: string, body: any, options?: HttpOptions): Observable<T> {
    this.overlayService.show();
    return this.http.patch<T>(url, body, options).pipe(
      finalize(() => this.overlayService.hide())
    );
  }

  delete<T>(url: string, options?: HttpOptions): Observable<T> {
    this.overlayService.show();
    return this.http.delete<T>(url, options).pipe(
      finalize(() => this.overlayService.hide())
    );
  }
}