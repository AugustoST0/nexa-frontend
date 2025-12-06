import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterConfig {
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  placeholder?: string;
  min?: number;
  max?: number;
  options?: Array<{ label: string; value: any }>;
}

@Component({
  selector: 'app-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.html',
  styleUrls: ['./filter.css'],
})
export class FilterComponent {
  @Input() config!: FilterConfig;
  @Output() filterChange = new EventEmitter<any>();

  filterValue: any;

  onValueChange(value: any): void {
    this.filterChange.emit(value);
  }
}
