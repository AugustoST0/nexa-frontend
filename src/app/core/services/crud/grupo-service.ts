import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Grupo } from '../../model/Grupo.model';
import { HttpService } from '../http-service';
import { GRUPO_ENDPOINTS } from '../../config/api-routes';

@Injectable({
  providedIn: 'root',
})
export class GrupoService {
  private readonly httpService = inject(HttpService);

  getAll(): Observable<Grupo[]> {
    return this.httpService.get<Grupo[]>(GRUPO_ENDPOINTS.GET_ALL);
  }

  getById(id: number): Observable<Grupo> {
    return this.httpService.get<Grupo>(GRUPO_ENDPOINTS.GET_BY_ID(id));
  }

  create(grupo: Grupo): Observable<Grupo> {
    return this.httpService.post<Grupo>(GRUPO_ENDPOINTS.CREATE, grupo);
  }

  update(id: number, grupo: Grupo): Observable<Grupo> {
    return this.httpService.put<Grupo>(
      GRUPO_ENDPOINTS.UPDATE(id),
      grupo
    );
  }

  delete(id: number): Observable<void> {
    return this.httpService.delete<void>(GRUPO_ENDPOINTS.DELETE(id));
  }
}
