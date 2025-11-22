import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { TokenResponseDTO } from '../dto/TokenResponseDTO';
import { JwtPayload } from '../dto/JwtPayload';
import { ModalService } from './modal-service';
import { AlertService } from './alert-service';
import { User } from '../model/User.model';
import { HttpService } from './http-service';
import { LocalStorageService } from './local-storage-service';
import { AUTH_ENDPOINTS } from '../config/api-routes';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly alertService = inject(AlertService);
  private readonly httpService = inject(HttpService);
  private readonly localStorageService = inject(LocalStorageService);

  private refreshInterval: any;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.loadUserFromToken();
  }

  loadUserFromToken() {
    const token = this.localStorageService.getAccessToken();
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

  login(credencials: {
    email: string;
    password: string;
  }): Observable<TokenResponseDTO> {
    return this.httpService
      .post<TokenResponseDTO>(AUTH_ENDPOINTS.LOGIN, credencials)
      .pipe(
        tap((tokens: TokenResponseDTO) => {
          this.localStorageService.setTokens(tokens.accessToken, tokens.refreshToken);
          this.loadUserFromToken();
          this.startTokenRefreshTimer();
        })
      );
  }

  refreshToken(): Observable<TokenResponseDTO> {
    const refreshToken = this.localStorageService.getRefreshToken();
    return this.httpService
      .post<TokenResponseDTO>(AUTH_ENDPOINTS.REFRESH, { refreshToken })
      .pipe(
        tap((tokens: TokenResponseDTO) => {
          this.localStorageService.setTokens(tokens.accessToken, tokens.refreshToken);
          this.startTokenRefreshTimer();
        })
      );
  }

  logout() {
    this.localStorageService.removeTokens();
    this.stopTokenRefreshTimer();
    this.currentUserSubject.next(null);
    this.modalService.close();
    this.router.navigate(['/login']);
  }

  startTokenRefreshTimer() {
    const token = this.localStorageService.getAccessToken();

    if (!token) return;

    const decoded = jwtDecode<JwtPayload>(token);
    const exp = decoded.exp * 1000;
    const now = Date.now();
    const delay = exp - now - 30_000;

    if (delay <= 0) {
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
          this.alertService.error('Token inválido');
          this.logout();
        } else if (err.status === 403) {
          this.alertService.error('Acesso negado');
          this.logout();
        } else if (err.status === 0 || !err.status) {
          if (retryCount < 3) {
            const retryDelay = Math.pow(2, retryCount) * 1000;
            this.alertService.warning(
              `Problema de conexão. Tentando novamente em ${retryDelay / 1000
              }s...`,
              'Conexão instável'
            );
            setTimeout(() => {
              this.tryRefreshOrLogout(retryCount + 1);
            }, retryDelay);
          } else {
            this.alertService.error(
              'Não foi possível renovar a sessão após várias tentativas',
              'Erro de rede'
            );
            this.logout();
          }
        } else {
          this.alertService.error('Erro inesperado ao renovar token');
          this.logout();
        }
      },
    });
  }

  stopTokenRefreshTimer() {
    clearTimeout(this.refreshInterval);
  }
}