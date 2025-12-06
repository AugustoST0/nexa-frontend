import { Injectable } from '@angular/core';
import { Subject, Observable, take } from 'rxjs';
import { FormModalConfig } from '../model/FormModalConfig.model';
import { ConfirmModalConfig } from '../model/ConfirmModalConfig.model';
import { ListModalConfig } from '../model/ListModalConfig.model';
import { DetailModalConfig } from '../model/DetailModalConfig.model';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private confirmModalSubject = new Subject<ConfirmModalConfig | null>();
  private confirmResponseSubject = new Subject<boolean>();

  private formModalSubject = new Subject<FormModalConfig | null>();
  private formResponseSubject = new Subject<any>();

  private listModalSubject = new Subject<ListModalConfig | null>();
  private detailModalSubject = new Subject<DetailModalConfig | null>();

  confirmModal$ = this.confirmModalSubject.asObservable();
  confirmResponse$ = this.confirmResponseSubject.asObservable();

  formModal$ = this.formModalSubject.asObservable();
  formResponse$ = this.formResponseSubject.asObservable();

  listModal$ = this.listModalSubject.asObservable();
  detailModal$ = this.detailModalSubject.asObservable();

  showConfirm(config: ConfirmModalConfig): Observable<boolean> {
    this.confirmModalSubject.next(config);
    return this.confirmResponse$.pipe(take(1));
  }

  showForm(config: FormModalConfig): Observable<any> {
    this.formModalSubject.next(config);
    return this.formResponse$.pipe(take(1));
  }

  showList(config: ListModalConfig): void {
    this.listModalSubject.next(config);
  }

  closeListModal(): void {
    this.listModalSubject.next(null);
  }

  showDetail(config: DetailModalConfig): void {
    this.detailModalSubject.next(config);
  }

  closeDetailModal(): void {
    this.detailModalSubject.next(null);
  }

  close() {
    this.confirmModalSubject.next(null);
    this.formModalSubject.next(null);
    this.listModalSubject.next(null);
    this.detailModalSubject.next(null);
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