import { Component, OnDestroy } from '@angular/core';
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

  constructor(
    public modalService: ModalService,
    private fb: FormBuilder
  ) {
    this.modalService.formModal$.pipe(takeUntil(this.destroy$)).subscribe((config) => {
      if (config) {
        this.config = config;
        this.buildForm(config);
      } else {
        this.config = null;
        this.form = new FormGroup({});
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
      default:
        return '';
    }
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
