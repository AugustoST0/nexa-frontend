import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Colaborador } from '../model/Colaborador';
import { ColaboradorWithCalcs } from '../model/ColaboradorWithCalcs';
import { ColaboradorCreateDTO } from '../dto/ColaboradorCreateDTO';
import { ColaboradorUpdateDTO } from '../dto/ColaboradorUpdateDTO';

@Injectable({
  providedIn: 'root',
})
export class ColaboradorService {
  private readonly http = inject(HttpClient);
  
  private readonly baseApiUrl = environment.baseApiUrl;
  private readonly apiUrl = `${this.baseApiUrl}/colaboradores`;

  getAll(): Observable<ColaboradorWithCalcs[]> {
    return this.http.get<ColaboradorWithCalcs[]>(this.apiUrl);
  }

  getById(id: number): Observable<ColaboradorWithCalcs> {
    return this.http.get<ColaboradorWithCalcs>(`${this.apiUrl}/${id}`);
  }

  create(colaborador: ColaboradorCreateDTO): Observable<Colaborador> {
    return this.http.post<Colaborador>(this.apiUrl, colaborador);
  }

  update(id: number, colaborador: ColaboradorUpdateDTO): Observable<Colaborador> {
    return this.http.put<Colaborador>(`${this.apiUrl}/${id}`, colaborador);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSubordinados(supervisorId: number): Observable<ColaboradorWithCalcs[]> {
    return this.http.get<ColaboradorWithCalcs[]>(`${this.apiUrl}/supervisor/${supervisorId}`);
  }
}
