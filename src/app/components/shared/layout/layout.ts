import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LucideAngularModule, LogOut, Users, Tags } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth-service';
import { ButtonComponent } from '../../ui/button/button';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, LucideAngularModule, ButtonComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly LogOut = LogOut;
  readonly Users = Users;
  readonly Tags = Tags;

  onLogout() {
    this.authService.logout();
  }
}
