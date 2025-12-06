export interface DetailField {
  label: string;
  value: any;
  type?: 'text' | 'badge' | 'date' | 'list';
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

export interface DetailSection {
  title?: string;
  fields: DetailField[];
}

export interface DetailModalConfig {
  title: string;
  sections: DetailSection[];
  closeText?: string;
}
