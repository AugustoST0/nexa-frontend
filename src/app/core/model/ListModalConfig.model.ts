import { FilterConfig } from './FilterConfig.model';
import { LucideIconData } from 'lucide-angular';

export interface ListColumn {
  field: string;
  label: string;
  width?: string; // e.g., '200px', '30%', 'auto'
}

export interface ListAction {
  label: string;
  icon?: LucideIconData;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  callback: (item: any) => void;
}

export interface ListModalConfig {
  title: string;
  data: any[];
  columns: ListColumn[];
  actions: ListAction[];
  filters?: FilterConfig[];
  emptyMessage?: string;
  closeText?: string;
}
