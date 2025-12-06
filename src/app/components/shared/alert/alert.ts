import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../core/services/alert-service';
import { AlertModel } from '../../../core/model/Alert.model';


@Component({
  selector: 'app-alert',
  imports: [CommonModule],
  templateUrl: './alert.html',
  styleUrl: './alert.css',
})
export class Alert implements OnInit {
  alerts: AlertModel[] = [];

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.alertService.alerts$.subscribe(alerts => {
      this.alerts = alerts;
    });
  }

  close(id: string) {
    this.alertService.remove(id);
  }

  getAlertClass(type: string): string {
    return `alert alert-${type}`;
  }
}