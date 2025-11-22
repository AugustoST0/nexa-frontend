import { Observable, finalize } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { User } from '../model/User.model';
import { UserUpdateResponseDTO } from '../dto/UserUpdateResponseDTO';
import { HttpService } from './http-service';
import { OverlayService } from './overlay-service';
import { USER_ENDPOINTS } from '../config/api-routes';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpService = inject(HttpService);
  private readonly overlayService = inject(OverlayService);

  getAll(): Observable<User[]> {
    this.overlayService.show();
    return this.httpService.get<User[]>(USER_ENDPOINTS.GET_ALL).pipe(
      finalize(() => this.overlayService.hide())
    );
  }

  getById(id: number): Observable<User> {
    this.overlayService.show();
    return this.httpService.get<User>(USER_ENDPOINTS.GET_BY_ID(id)).pipe(
      finalize(() => this.overlayService.hide())
    );
  }

  register(user: User): Observable<User> {
    this.overlayService.show();
    return this.httpService.post<User>(USER_ENDPOINTS.REGISTER, user).pipe(
      finalize(() => this.overlayService.hide())
    );
  }

  update(id: number, user: User): Observable<UserUpdateResponseDTO> {
    this.overlayService.show();
    return this.httpService.put<UserUpdateResponseDTO>(
      USER_ENDPOINTS.UPDATE(id),
      user
    ).pipe(
      finalize(() => this.overlayService.hide())
    );
  }

  delete(id: number): Observable<void> {
    this.overlayService.show();
    return this.httpService.delete<void>(USER_ENDPOINTS.DELETE(id)).pipe(
      finalize(() => this.overlayService.hide())
    );
  }
}