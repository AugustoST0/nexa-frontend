import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../../core/services/crud/user-service';
import { AlertService } from '../../../core/services/alert-service';
import { User } from '../../../core/model/User.model';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { FormFieldComponent } from '../../ui/form-field/form-field';
import { CardComponent } from '../../ui/card/card';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, CommonModule, ButtonComponent, InputComponent, FormFieldComponent, CardComponent],
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cadastro implements OnInit {
  private readonly userService = inject(UserService);
  private readonly fb = inject(FormBuilder);
  private readonly alertService = inject(AlertService);

  registerForm!: FormGroup;
  isSubmitting = false;

  ngOnInit() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(150)],
      ],
      password: ['', [Validators.required, Validators.minLength(5)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(5)]],
      admin: [false],
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.alertService.error('Preencha todos os campos corretamente.');
      this.registerForm.markAllAsTouched();
      return;
    }

    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.alertService.error('Senhas não conferem.');
      return;
    }

    const payload: User = {
      name: this.registerForm.get('name')?.value,
      email: this.registerForm.get('email')?.value,
      password: password,
      admin: this.registerForm.get('admin')?.value,
    };

    this.isSubmitting = true;
    this.userService.register(payload).subscribe({
      next: () => {
        this.alertService.success('Usuário cadastrado com sucesso.');
        this.registerForm.reset({ admin: false });
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 409 && err.error.code === 'EMAIL_ALREADY_EXISTS') {
          this.alertService.error('E-mail já está sendo utilizado.');
        } else {
          this.alertService.error('Erro ao registrar usuário.');
        }
        console.error(err);
      },
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['maxlength']) {
      return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  hasError(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}