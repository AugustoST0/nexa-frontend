import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Grupo } from '../model/Grupo';

@Injectable({
  providedIn: 'root',
})
export class GrupoService {
  private readonly http = inject(HttpClient);
  
  private readonly baseApiUrl = environment.baseApiUrl;
  private readonly apiUrl = `${this.baseApiUrl}/grupos`;

  getAll(): Observable<Grupo[]> {
    return this.http.get<Grupo[]>(this.apiUrl);
  }

  getById(id: number): Observable<Grupo> {
    return this.http.get<Grupo>(`${this.apiUrl}/${id}`);
  }

  create(grupo: Grupo): Observable<Grupo> {
    return this.http.post<Grupo>(this.apiUrl, grupo);
  }

  update(id: number, grupo: Grupo): Observable<Grupo> {
    return this.http.put<Grupo>(`${this.apiUrl}/${id}`, grupo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
