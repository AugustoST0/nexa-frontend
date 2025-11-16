import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ModalOptions } from '../model/ModalOptions';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalSubject = new Subject<ModalOptions>();
  private responseSubject = new Subject<boolean>();

  modal$ = this.modalSubject.asObservable();
  response$ = this.responseSubject.asObservable();

  show(options: ModalOptions) {
    this.modalSubject.next(options);
    return this.response$;
  }

  close() {
    this.modalSubject.next(null as any);
  }

  confirm() {
    this.responseSubject.next(true);
  }

  cancel() {
    this.responseSubject.next(false);
  }
}