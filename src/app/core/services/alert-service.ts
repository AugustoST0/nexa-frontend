import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AlertModel, AlertType } from '../../core/model/Alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new BehaviorSubject<AlertModel[]>([]);
  public alerts$: Observable<AlertModel[]> = this.alertSubject.asObservable();

  success(message: string, title: string = 'Sucesso', duration: number = 5000) {
    this.show(AlertType.SUCCESS, message, title, duration);
  }

  error(message: string, title: string = 'Erro', duration: number = 5000) {
    this.show(AlertType.ERROR, message, title, duration);
  }

  warning(message: string, title: string = 'Atenção', duration: number = 5000) {
    this.show(AlertType.WARNING, message, title, duration);
  }

  info(message: string, title: string = 'Informação', duration: number = 5000) {
    this.show(AlertType.INFO, message, title, duration);
  }

  private show(type: AlertType, message: string, title?: string, duration?: number) {
    const alert: AlertModel = {
      id: this.generateId(),
      type,
      message,
      title,
      duration
    };

    const currentAlerts = this.alertSubject.value;
    this.alertSubject.next([...currentAlerts, alert]);

    if (duration && duration > 0) {
      setTimeout(() => this.remove(alert.id), duration);
    }
  }

  remove(id: string) {
    const currentAlerts = this.alertSubject.value;
    const filteredAlerts = currentAlerts.filter(alert => alert.id !== id);
    this.alertSubject.next(filteredAlerts);
  }

  clear() {
    this.alertSubject.next([]);
  }

  private generateId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}