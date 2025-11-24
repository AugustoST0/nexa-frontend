import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Alert } from './components/shared/alert/alert';
import { SpinnerComponent } from './components/shared/spinner/spinner';
import { ConfirmModalComponent } from './components/shared/confirm-modal/confirm-modal';
import { FormModalComponent } from './components/shared/form-modal/form-modal';
import { ListModalComponent } from './components/shared/list-modal/list-modal';
import { ActivityMonitorService } from './core/services/activity-monitor-service';
import { LocalStorageService } from './core/services/local-storage-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Alert, SpinnerComponent, ConfirmModalComponent, FormModalComponent, ListModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('nexa-frontend');

  private readonly activityMonitorService = inject(ActivityMonitorService);
  private readonly localStorageService = inject(LocalStorageService);

  ngOnInit() {
    const token = this.localStorageService.getAccessToken();
    if (token) {
      this.activityMonitorService.initMonitoring();
    }
  }
}
