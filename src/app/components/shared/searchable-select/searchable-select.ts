import { Component, ElementRef, EventEmitter, HostListener, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SearchableOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-searchable-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './searchable-select.html',
  styleUrls: ['./searchable-select.css'],
})
export class SearchableSelectComponent {
  private readonly elementRef = inject(ElementRef);

  @Input() options: SearchableOption[] = [];
  @Input() placeholder = 'Selecione...';
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  isOpen = signal(false);
  search = signal('');

  get selectedLabel(): string {
    if (this.value === '' || this.value === null || this.value === undefined) return '';
    const option = this.options.find((o) => String(o.value) === String(this.value));
    return option ? option.label : '';
  }

  get filteredOptions(): SearchableOption[] {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.options;
    return this.options.filter((o) => o.label.toLowerCase().includes(term));
  }

  isSelected(option: SearchableOption): boolean {
    return String(option.value) === String(this.value);
  }

  open(): void {
    this.isOpen.set(true);
    this.search.set('');
  }

  onSearchInput(term: string): void {
    this.search.set(term);
    if (!this.isOpen()) this.isOpen.set(true);
  }

  select(option: SearchableOption): void {
    this.valueChange.emit(String(option.value));
    this.isOpen.set(false);
    this.search.set('');
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    this.valueChange.emit('');
    this.search.set('');
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.search.set('');
    }
  }
}
