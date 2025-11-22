import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { ConfirmModalConfig } from '../model/ConfirmModalConfig.model';
import { FormModalConfig } from '../model/FormModalConfig.model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private confirmModalSubject = new Subject<ConfirmModalConfig | null>();
  private confirmResponseSubject = new Subject<boolean>();

  private formModalSubject = new Subject<FormModalConfig | null>();
  private formResponseSubject = new Subject<any>();

  confirmModal$ = this.confirmModalSubject.asObservable();
  confirmResponse$ = this.confirmResponseSubject.asObservable();

  formModal$ = this.formModalSubject.asObservable();
  formResponse$ = this.formResponseSubject.asObservable();

  showConfirm(config: ConfirmModalConfig): Observable<boolean> {
    this.confirmModalSubject.next(config);
    return this.confirmResponse$;
  }

  showForm(config: FormModalConfig): Observable<any> {
    this.formModalSubject.next(config);
    return this.formResponse$;
  }

  close() {
    this.confirmModalSubject.next(null);
    this.formModalSubject.next(null);
  }

  confirm() {
    this.confirmResponseSubject.next(true);
    this.confirmModalSubject.next(null);
  }

  cancel() {
    this.confirmResponseSubject.next(false);
    this.confirmModalSubject.next(null);
  }

  submitForm(data: any) {
    this.formResponseSubject.next(data);
    this.formModalSubject.next(null);
  }

  cancelForm() {
    this.formResponseSubject.next(null);
    this.formModalSubject.next(null);
  }
}