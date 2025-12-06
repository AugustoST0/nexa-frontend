import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { ModalService } from '../../../core/services/modal-service';
import { ListModalConfig } from '../../../core/model/ListModalConfig.model';
import { FilterComponent } from '../../ui/filter/filter';
import { ButtonComponent } from '../../ui/button/button';

@Component({
  selector: 'app-list-modal',
  imports: [CommonModule, LucideAngularModule, FilterComponent, ButtonComponent],
  templateUrl: './list-modal.html',
  styleUrls: ['./list-modal.css'],
})
export class ListModalComponent implements OnDestroy {
  config: ListModalConfig | null = null;
  filteredData: any[] = [];
  filterValues: { [key: string]: any } = {};
  private destroy$ = new Subject<void>();

  constructor(public modalService: ModalService) {
    this.modalService.listModal$.pipe(takeUntil(this.destroy$)).subscribe((config) => {
      if (config) {
        this.config = config;
        this.filteredData = [...config.data];
        this.filterValues = {};
      } else {
        this.config = null;
        this.filteredData = [];
        this.filterValues = {};
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFilterChange(event: { name: string; value: any }) {
    this.filterValues[event.name] = event.value;
    this.applyFilters();
  }

  private applyFilters() {
    if (!this.config) return;

    this.filteredData = this.config.data.filter((item) => {
      return Object.keys(this.filterValues).every((filterName) => {
        const filterValue = this.filterValues[filterName];
        const filter = this.config!.filters?.find((f) => f.name === filterName);

        if (!filter || filterValue === '' || filterValue === null || filterValue === undefined) {
          return true;
        }

        const itemValue = this.getNestedValue(item, filterName);

        switch (filter.type) {
          case 'text':
            return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'number':
            return Number(itemValue) === Number(filterValue);
          case 'select':
            return itemValue === filterValue;
          case 'date':
            return new Date(itemValue).toDateString() === new Date(filterValue).toDateString();
          case 'boolean':
            return Boolean(itemValue) === Boolean(filterValue);
          default:
            return true;
        }
      });
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }

  getFieldValue(item: any, field: string): any {
    return this.getNestedValue(item, field);
  }

  onAction(action: any, item: any) {
    action.callback(item);
  }

  onClose() {
    this.modalService.closeListModal();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
