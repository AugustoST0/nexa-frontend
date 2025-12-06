import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule, X } from 'lucide-angular';
import { ModalService } from '../../../core/services/modal-service';
import { DetailModalConfig } from '../../../core/model/DetailModalConfig.model';
import { ButtonComponent } from '../../ui/button/button';
import { BadgeComponent } from '../../ui/badge/badge';
import { CardComponent } from '../../ui/card/card';

@Component({
  selector: 'app-detail-modal',
  imports: [CommonModule, LucideAngularModule, ButtonComponent, BadgeComponent, CardComponent],
  templateUrl: './detail-modal.html',
  styleUrls: ['./detail-modal.css'],
})
export class DetailModalComponent implements OnDestroy {
  config: DetailModalConfig | null = null;
  private destroy$ = new Subject<void>();
  readonly X = X;

  constructor(public modalService: ModalService) {
    this.modalService.detailModal$.pipe(takeUntil(this.destroy$)).subscribe((config) => {
      this.config = config;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onClose() {
    this.modalService.closeDetailModal();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
