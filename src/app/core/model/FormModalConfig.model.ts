export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'multi-select'
  | 'tag-selector'
  | 'checkbox'
  | 'radio'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'tel'
  | 'url'
  | 'color';

export interface FormFieldOption {
  label: string;
  value: any;
}

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  value?: any;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: FormFieldOption[];
  validators?: any[];
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  rows?: number;
  cols?: number;
}

export interface FormModalConfig {
  title: string;
  fields: FormField[];
  submitText?: string;
  cancelText?: string;
  width?: string;
}
