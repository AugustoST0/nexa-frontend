import { Component, OnInit } from '@angular/core';
import {
  Validators,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { UserService } from '../../../core/services/user-service';
import { AlertService } from '../../../core/services/alert-service';
import { User } from '../../../core/model/User.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.css'],
})
export class Cadastro implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private alertService: AlertService
  ) { }

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

    console.log('Payload de registro:', payload);

    this.userService.register(payload).subscribe({
      next: () => {
        this.alertService.success('Usuário cadastrado com sucesso.');
        this.registerForm.reset({ admin: false });
      },
      error: (err) => {
        if (err.status === 409 && err.error.code === 'EMAIL_ALREADY_EXISTS') {
          this.alertService.error('E-mail já está sendo utilizado.');
        } else {
          this.alertService.error('Erro ao registrar usuário.');
        }
        console.error(err);
      },
    });
  }
}