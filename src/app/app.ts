import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Alert } from './components/shared/alert/alert';
import { SpinnerComponent } from './components/shared/spinner/spinner';
import { ConfirmModalComponent } from './components/shared/confirm-modal/confirm-modal';
import { FormModalComponent } from './components/shared/form-modal/form-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Alert, SpinnerComponent, ConfirmModalComponent, FormModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('nexa-frontend');
}
