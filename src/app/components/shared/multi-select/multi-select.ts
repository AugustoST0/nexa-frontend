import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MultiSelectOption {
  value: number;
  label: string;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './multi-select.html',
  styleUrls: ['./multi-select.css'],
})
export class MultiSelectComponent implements OnInit, OnDestroy {
  private readonly elementRef = inject(ElementRef);

  private readonly closeOnOutsideClick = (event: MouseEvent) => {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.search.set('');
    }
  };

  ngOnInit(): void {
    document.addEventListener('click', this.closeOnOutsideClick, true);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.closeOnOutsideClick, true);
  }

  @Input() options: MultiSelectOption[] = [];
  @Input() placeholder = 'Selecione...';
  @Input() selected: number[] = [];
  @Output() selectedChange = new EventEmitter<number[]>();

  isOpen = signal(false);
  search = signal('');

  get filteredOptions(): MultiSelectOption[] {
    const term = this.search().trim().toLowerCase();
    if (!term) return this.options;
    return this.options.filter((o) => o.label.toLowerCase().includes(term));
  }

  get selectedLabels(): string[] {
    return this.selected
      .map((v) => this.options.find((o) => o.value === v)?.label ?? String(v));
  }

  isSelected(value: number): boolean {
    return this.selected.includes(value);
  }

  open(): void {
    this.isOpen.set(true);
  }

  onSearchInput(term: string): void {
    this.search.set(term);
    if (!this.isOpen()) this.isOpen.set(true);
  }

  toggle(value: number): void {
    const next = this.isSelected(value)
      ? this.selected.filter((v) => v !== value)
      : [...this.selected, value];
    this.selectedChange.emit(next);
  }

  removePill(value: number, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedChange.emit(this.selected.filter((v) => v !== value));
  }

  clearAll(event: MouseEvent): void {
    event.stopPropagation();
    this.search.set('');
    this.isOpen.set(false);
    this.selectedChange.emit([]);
  }

}
