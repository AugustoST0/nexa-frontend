import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule, Home, Folder, Users, UserPlus, BarChart3, LogOut, Layers } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly authService = inject(AuthService);

  readonly Home = Home;
  readonly Folder = Folder;
  readonly Users = Users;
  readonly UserPlus = UserPlus;
  readonly BarChart3 = BarChart3;
  readonly LogOut = LogOut;
  readonly Layers = Layers;

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  onLogout() {
    this.authService.logout();
  }
}
