import { Component, HostListener, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { LucideAngularModule, Home, Folder, Users, UserPlus, BarChart3, LogOut, Layers, UserCircle } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly Home = Home;
  readonly Folder = Folder;
  readonly Users = Users;
  readonly UserPlus = UserPlus;
  readonly BarChart3 = BarChart3;
  readonly LogOut = LogOut;
  readonly Layers = Layers;
  readonly UserCircle = UserCircle;

  showUserMenu = signal(false);
  nomeUsuario = toSignal(this.authService.currentUser$, { initialValue: null });

  @HostListener('document:click')
  closeUserMenu(): void {
    this.showUserMenu.set(false);
  }

  toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.showUserMenu.update(v => !v);
  }

  onPerfil(): void {
    this.showUserMenu.set(false);
    this.router.navigate(['/perfil']);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  onLogout(): void {
    this.showUserMenu.set(false);
    this.authService.logout();
  }
}
