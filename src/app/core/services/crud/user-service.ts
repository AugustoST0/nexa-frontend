import { Observable } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { User } from '../../model/User.model';
import { UserUpdateResponseDTO } from '../../dto/UserUpdateResponseDTO';
import { HttpService } from '../http-service';
import { USER_ENDPOINTS } from '../../config/api-routes';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpService = inject(HttpService);

  getAll(): Observable<User[]> {
    return this.httpService.get<User[]>(USER_ENDPOINTS.GET_ALL);
  }

  getById(id: number): Observable<User> {
    return this.httpService.get<User>(USER_ENDPOINTS.GET_BY_ID(id));
  }

  register(user: User): Observable<User> {
    return this.httpService.post<User>(USER_ENDPOINTS.REGISTER, user);
  }

  update(id: number, user: User): Observable<UserUpdateResponseDTO> {
    return this.httpService.put<UserUpdateResponseDTO>(
      USER_ENDPOINTS.UPDATE(id),
      user
    );
  }

  delete(id: number): Observable<void> {
    return this.httpService.delete<void>(USER_ENDPOINTS.DELETE(id));
  }

  getMe(): Observable<User> {
    return this.httpService.get<User>(USER_ENDPOINTS.GET_ME);
  }

  updateMe(dto: { name?: string; email?: string; password?: string }): Observable<UserUpdateResponseDTO> {
    return this.httpService.put<UserUpdateResponseDTO>(USER_ENDPOINTS.UPDATE_ME, dto);
  }
}