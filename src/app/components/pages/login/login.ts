import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { AlertService } from '../../../core/services/alert-service';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { FormFieldComponent } from '../../ui/form-field/form-field';
import { CardComponent } from '../../ui/card/card';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, ButtonComponent, InputComponent, FormFieldComponent, CardComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);

  loginForm: FormGroup;
  isSubmitting = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
    });
  }

  ngOnInit() {
    this.authService.currentUser$
      .pipe(take(1))
      .subscribe((currentUserExists) => {
        if (currentUserExists) {
          this.router.navigate(['/catalogo']);
        }
      });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.alertService.error('Preencha todos os campos corretamente.');
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.alertService.success('Login efetivado com sucesso.');
        this.router.navigate(['/catalogo']);
      },
      error: (err) => {
        this.isSubmitting = false;
        if (err.status === 401) {
          const code = err.error?.code;

          if (code === 'USER_NOT_FOUND') {
            this.alertService.error('E-mail não encontrado');
          } else if (code === 'INVALID_CREDENTIALS') {
            this.alertService.error('Senha incorreta');
          } else {
            this.alertService.error('Erro inesperado.');
          }
        }
      },
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['minlength']) {
      return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  hasError(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}