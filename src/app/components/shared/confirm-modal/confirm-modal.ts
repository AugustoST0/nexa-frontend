import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../../core/services/modal-service';

@Component({
  selector: 'app-confirm-modal',
  imports: [CommonModule],
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.css'],
})
export class ConfirmModalComponent {
  constructor(public modalService: ModalService) { }

  onConfirm(): void {
    this.modalService.confirm();
  }

  onCancel(): void {
    this.modalService.cancel();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
