import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalService } from '../../../core/services/modal-service';
import { FormModalConfig, FormField } from '../../../core/model/FormModalConfig.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-form-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-modal.html',
  styleUrls: ['./form-modal.css'],
})
export class FormModalComponent implements OnDestroy {
  form: FormGroup = new FormGroup({});
  config: FormModalConfig | null = null;
  private destroy$ = new Subject<void>();
  
  // Tag selector state
  tagSelectorDropdownOpen = signal<{ [key: string]: boolean }>({});
  tagSelectorSearch = signal<{ [key: string]: string }>({});

  constructor(
    public modalService: ModalService,
    private fb: FormBuilder
  ) {
    this.modalService.formModal$.pipe(takeUntil(this.destroy$)).subscribe((config) => {
      if (config) {
        this.config = config;
        this.buildForm(config);
        this.initializeTagSelectors(config);
      } else {
        this.config = null;
        this.form = new FormGroup({});
        this.tagSelectorDropdownOpen.set({});
        this.tagSelectorSearch.set({});
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildForm(config: FormModalConfig): void {
    const group: { [key: string]: FormControl } = {};

    config.fields.forEach((field) => {
      const validators = this.getValidators(field);
      const value = field.value !== undefined && field.value !== null
        ? field.value
        : this.getDefaultValue(field);
      group[field.name] = this.fb.control(
        { value: value, disabled: field.disabled || false },
        validators
      );
    });

    this.form = this.fb.group(group);
  }

  private getValidators(field: FormField): any[] {
    const validators: any[] = [];

    if (field.required) {
      validators.push(Validators.required);
    }

    if (field.minLength) {
      validators.push(Validators.minLength(field.minLength));
    }

    if (field.maxLength) {
      validators.push(Validators.maxLength(field.maxLength));
    }

    if (field.min !== undefined) {
      validators.push(Validators.min(field.min));
    }

    if (field.max !== undefined) {
      validators.push(Validators.max(field.max));
    }

    if (field.pattern) {
      validators.push(Validators.pattern(field.pattern));
    }

    if (field.type === 'email') {
      validators.push(Validators.email);
    }

    if (field.validators) {
      validators.push(...field.validators);
    }

    return validators;
  }

  private getDefaultValue(field: FormField): any {
    switch (field.type) {
      case 'checkbox':
        return false;
      case 'number':
        return null;
      case 'multi-select':
      case 'tag-selector':
        return [];
      default:
        return '';
    }
  }

  private initializeTagSelectors(config: FormModalConfig): void {
    const dropdownState: { [key: string]: boolean } = {};
    const searchState: { [key: string]: string } = {};
    
    config.fields.forEach(field => {
      if (field.type === 'tag-selector') {
        dropdownState[field.name] = false;
        searchState[field.name] = '';
      }
    });
    
    this.tagSelectorDropdownOpen.set(dropdownState);
    this.tagSelectorSearch.set(searchState);
  }

  toggleTagSelectorDropdown(fieldName: string): void {
    const current = this.tagSelectorDropdownOpen();
    this.tagSelectorDropdownOpen.set({
      ...current,
      [fieldName]: !current[fieldName]
    });
  }

  closeTagSelectorDropdown(fieldName: string): void {
    const current = this.tagSelectorDropdownOpen();
    this.tagSelectorDropdownOpen.set({
      ...current,
      [fieldName]: false
    });
  }

  onTagSelectorSearchChange(fieldName: string, value: string): void {
    const current = this.tagSelectorSearch();
    this.tagSelectorSearch.set({
      ...current,
      [fieldName]: value
    });
  }

  getFilteredTagSelectorOptions(field: FormField): any[] {
    const search = (this.tagSelectorSearch()[field.name] || '').toLowerCase();
    return (field.options || []).filter(option =>
      option.label.toLowerCase().includes(search)
    );
  }

  toggleTagSelectorOption(fieldName: string, optionValue: any): void {
    const control = this.form.get(fieldName);
    if (control) {
      const current = control.value || [];
      if (current.includes(optionValue)) {
        control.setValue(current.filter((v: any) => v !== optionValue));
      } else {
        control.setValue([...current, optionValue]);
      }
    }
  }

  isTagSelectorOptionSelected(fieldName: string, optionValue: any): boolean {
    const control = this.form.get(fieldName);
    return control && (control.value || []).includes(optionValue);
  }

  removeTagSelectorOption(fieldName: string, optionValue: any): void {
    const control = this.form.get(fieldName);
    if (control) {
      const current = control.value || [];
      control.setValue(current.filter((v: any) => v !== optionValue));
    }
  }

  getSelectedTagSelectorLabels(fieldName: string, field: FormField): string[] {
    const control = this.form.get(fieldName);
    const selectedValues = control?.value || [];
    return selectedValues.map((value: any) => {
      const option = (field.options || []).find(opt => opt.value === value);
      return option?.label || '';
    }).filter((label: string) => label);
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.modalService.submitForm(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.modalService.cancelForm();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  getFieldError(fieldName: string): string {
    const control = this.form.get(fieldName);
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors['required']) {
      return 'Este campo é obrigatório';
    }
    if (control.errors['email']) {
      return 'E-mail inválido';
    }
    if (control.errors['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres`;
    }
    if (control.errors['min']) {
      return `Valor mínimo: ${control.errors['min'].min}`;
    }
    if (control.errors['max']) {
      return `Valor máximo: ${control.errors['max'].max}`;
    }
    if (control.errors['pattern']) {
      return 'Formato inválido';
    }

    return 'Campo inválido';
  }
}
