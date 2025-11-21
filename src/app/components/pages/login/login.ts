import { Component, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  
  loginForm: FormGroup;

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
          this.router.navigate(['/dashboard']);
        }
      });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.toastr.error('Preencha todos os campos corretamente.', 'Erro');
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.toastr.success('Login efetivado com sucesso.', 'Sucesso');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        if (err.status === 401) {
          const code = err.error?.code;

          if (code === 'USER_NOT_FOUND') {
            this.toastr.error('E-mail não encontrado', 'Erro');
          } else if (code === 'INVALID_CREDENTIALS') {
            this.toastr.error('Senha incorreta', 'Erro');
          } else {
            this.toastr.error('Erro inesperado.', 'Erro');
          }
        }
      },
    });
  }
}