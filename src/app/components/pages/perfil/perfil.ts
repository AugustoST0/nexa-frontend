import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../core/services/auth-service';
import { UserService } from '../../../core/services/crud/user-service';
import { AlertService } from '../../../core/services/alert-service';
import { LocalStorageService } from '../../../core/services/local-storage-service';
import { ButtonComponent } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { FormFieldComponent } from '../../ui/form-field/form-field';

@Component({
  selector: 'app-perfil',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent, FormFieldComponent],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css'],
})
export class Perfil implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly alertService = inject(AlertService);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly fb = inject(FormBuilder);

  currentUser = toSignal(this.authService.currentUser$, { initialValue: null });
  editMode = signal(false);
  saving = signal(false);

  perfilForm!: FormGroup;

  ngOnInit(): void {
    this.perfilForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      newPassword: [''],
      confirmPassword: [''],
    });
  }

  onEdit(): void {
    const user = this.currentUser();
    this.perfilForm.patchValue({
      name: user?.name ?? '',
      email: user?.email ?? '',
      newPassword: '',
      confirmPassword: '',
    });
    this.editMode.set(true);
  }

  onCancel(): void {
    this.editMode.set(false);
    this.perfilForm.reset();
  }

  get hasPassword(): boolean {
    return !!this.perfilForm.get('newPassword')?.value;
  }

  getErrorMessage(field: string): string {
    const control = this.perfilForm.get(field);
    if (!control?.errors || !control.touched) return '';
    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'E-mail inválido';
    if (control.errors['maxlength']) return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres`;
    if (control.errors['minlength']) return `Mínimo de ${control.errors['minlength'].requiredLength} caracteres`;
    return 'Campo inválido';
  }

  hasError(field: string): boolean {
    const control = this.perfilForm.get(field);
    return !!(control?.invalid && control.touched);
  }

  onSave(): void {
    if (this.perfilForm.invalid) {
      this.perfilForm.markAllAsTouched();
      return;
    }

    const { name, email, newPassword, confirmPassword } = this.perfilForm.value;

    if (newPassword && newPassword !== confirmPassword) {
      this.alertService.error('As senhas não coincidem');
      return;
    }

    if (newPassword && newPassword.length < 5) {
      this.alertService.error('A senha deve ter pelo menos 5 caracteres');
      return;
    }

    const dto: { name?: string; email?: string; password?: string } = {};
    if (name?.trim()) dto.name = name.trim();
    if (email?.trim()) dto.email = email.trim();
    if (newPassword?.trim()) dto.password = newPassword.trim();

    this.saving.set(true);

    this.userService.updateMe(dto).subscribe({
      next: (res) => {
        this.localStorageService.setTokens(res.accessToken, res.refreshToken);
        this.authService.loadUserFromToken();
        this.alertService.success('Perfil atualizado com sucesso');
        this.editMode.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        if (err.status === 409) {
          this.alertService.error('E-mail já está em uso');
        } else {
          this.alertService.error('Erro ao atualizar perfil');
        }
        this.saving.set(false);
      },
    });
  }
}
