export type FilterType = 'text' | 'number' | 'select' | 'date' | 'boolean';

export interface FilterOption {
  label: string;
  value: any;
}

export interface FilterConfig {
  name: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: FilterOption[]; // For select type
  min?: number; // For number/date type
  max?: number; // For number/date type
}
