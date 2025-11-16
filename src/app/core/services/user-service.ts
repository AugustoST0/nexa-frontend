import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

import { User } from '../model/User';

import { environment } from '../../../environments/environment';
import { UserUpdateResponseDTO } from '../dto/UserUpdateResponseDTO';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  baseApiUrl = environment.baseApiUrl;
  apiUrl = `${this.baseApiUrl}/users`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  update(id: number, user: User): Observable<UserUpdateResponseDTO> {
    return this.http.put<UserUpdateResponseDTO>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}