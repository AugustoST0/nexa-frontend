import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { TokenResponseDTO } from '../dto/TokenResponseDTO';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../dto/JwtPayload';
import { ModalService } from './modal-service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly toastr = inject(ToastrService);

  baseApiUrl = environment.baseApiUrl;
  apiUrl = `${this.baseApiUrl}/auth`;

  private refreshInterval: any;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromToken();
  }

  loadUserFromToken() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const decoded = jwtDecode<JwtPayload>(token);
    const user: User = {
      id: decoded.userId,
      name: decoded.userName,
      email: decoded.sub,
      admin: decoded.groups.includes('ADMIN'),
    };

    this.currentUserSubject.next(user);
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  login(credencials: {
    email: string;
    password: string;
  }): Observable<TokenResponseDTO> {
    return this.http
      .post<TokenResponseDTO>(`${this.apiUrl}/login`, credencials)
      .pipe(
        tap((tokens: TokenResponseDTO) => {
          this.setTokens(tokens.accessToken, tokens.refreshToken);
          this.loadUserFromToken();
          this.startTokenRefreshTimer();
        })
      );
  }

  refreshToken(): Observable<TokenResponseDTO> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http
      .post<TokenResponseDTO>(`${this.apiUrl}/refresh`, { refreshToken })
      .pipe(
        tap((tokens: TokenResponseDTO) => {
          this.setTokens(tokens.accessToken, tokens.refreshToken);
          this.startTokenRefreshTimer();
        })
      );
  }

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.stopTokenRefreshTimer();
    this.currentUserSubject.next(null);
    this.modalService.close();
    this.router.navigate(['/login']);
  }

  startTokenRefreshTimer() {
    const token = localStorage.getItem('accessToken');

    if (!token) return;

    const decoded = jwtDecode<JwtPayload>(token);
    const exp = decoded.exp * 1000;
    const now = Date.now();
    const delay = exp - now - 30_000;

    if (delay <= 0) {
      // token já expirou ou vai expirar em menos de 30 segundos
      this.tryRefreshOrLogout();
      return;
    }

    if (this.refreshInterval) {
      this.stopTokenRefreshTimer();
    }

    this.refreshInterval = setTimeout(() => {
      this.tryRefreshOrLogout();
    }, delay);
  }

  public tryRefreshOrLogout(retryCount = 0) {
    this.refreshToken().subscribe({
      next: () => {
        this.loadUserFromToken();
      },
      error: (err) => {
        if (err.status === 401) {
          this.toastr.error('Token inválido', 'Erro');
          this.logout();
        } else if (err.status === 403) {
          this.toastr.error('Acesso negado', 'Erro');
          this.logout();
        }
        // erro de rede
        else if (err.status === 0 || !err.status) {
          if (retryCount < 3) {
            const retryDelay = Math.pow(2, retryCount) * 1000; // backoff: 1s, 2s, 4s
            this.toastr.warning(
              `Problema de conexão. Tentando novamente em ${retryDelay / 1000
              }s...`,
              'Conexão instável'
            );
            setTimeout(() => {
              this.tryRefreshOrLogout(retryCount + 1);
            }, retryDelay);
          } else {
            this.toastr.error(
              'Não foi possível renovar a sessão após várias tentativas',
              'Erro de rede'
            );
            this.logout();
          }
        } else {
          this.toastr.error('Erro inesperado ao renovar token', 'Erro');
          this.logout();
        }
      },
    });
  }

  stopTokenRefreshTimer() {
    clearTimeout(this.refreshInterval);
  }
}