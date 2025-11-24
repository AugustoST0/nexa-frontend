import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterConfig } from '../../../core/model/FilterConfig.model';

@Component({
  selector: 'app-filter',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter.html',
  styleUrls: ['./filter.css'],
})
export class FilterComponent {
  @Input() config!: FilterConfig;
  @Output() filterChange = new EventEmitter<{ name: string; value: any }>();

  filterValue: any = '';

  onValueChange(value: any) {
    this.filterValue = value;
    this.filterChange.emit({ name: this.config.name, value });
  }

  clearFilter() {
    this.filterValue = this.config.type === 'boolean' ? false : '';
    this.onValueChange(this.filterValue);
  }
}
