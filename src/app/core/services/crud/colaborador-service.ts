import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Colaborador } from '../../model/Colaborador.model';
import { ColaboradorWithCalcs } from '../../model/ColaboradorWithCalcs.model';
import { ColaboradorCreateDTO } from '../../dto/ColaboradorCreateDTO';
import { ColaboradorUpdateDTO } from '../../dto/ColaboradorUpdateDTO';
import { HttpService } from '../http-service';
import { COLABORADOR_ENDPOINTS } from '../../config/api-routes';

@Injectable({
  providedIn: 'root',
})
export class ColaboradorService {
  private readonly httpService = inject(HttpService);

  getAll(): Observable<ColaboradorWithCalcs[]> {
    return this.httpService.get<ColaboradorWithCalcs[]>(COLABORADOR_ENDPOINTS.GET_ALL);
  }

  getById(id: number): Observable<ColaboradorWithCalcs> {
    return this.httpService.get<ColaboradorWithCalcs>(COLABORADOR_ENDPOINTS.GET_BY_ID(id));
  }

  create(colaborador: ColaboradorCreateDTO): Observable<Colaborador> {
    return this.httpService.post<Colaborador>(COLABORADOR_ENDPOINTS.CREATE, colaborador);
  }

  update(id: number, colaborador: ColaboradorUpdateDTO): Observable<Colaborador> {
    return this.httpService.put<Colaborador>(
      COLABORADOR_ENDPOINTS.UPDATE(id),
      colaborador
    );
  }

  delete(id: number): Observable<void> {
    return this.httpService.delete<void>(COLABORADOR_ENDPOINTS.DELETE(id));
  }

  toggleStatus(id: number): Observable<Colaborador> {
    return this.httpService.patch<Colaborador>(COLABORADOR_ENDPOINTS.TOGGLE_STATUS(id), {});
  }

  getSubordinados(supervisorId: number): Observable<ColaboradorWithCalcs[]> {
    return this.httpService.get<ColaboradorWithCalcs[]>(`${COLABORADOR_ENDPOINTS.GET_ALL}/supervisor/${supervisorId}`);
  }
}
