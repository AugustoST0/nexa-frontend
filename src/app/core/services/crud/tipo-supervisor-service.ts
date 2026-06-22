import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoSupervisor } from '../../model/Supervisao.model';
import { HttpService } from '../http-service';
import { TIPO_SUPERVISOR_ENDPOINTS } from '../../config/api-routes';

@Injectable({
  providedIn: 'root',
})
export class TipoSupervisorService {
  private readonly httpService = inject(HttpService);

  getAll(): Observable<TipoSupervisor[]> {
    return this.httpService.get<TipoSupervisor[]>(TIPO_SUPERVISOR_ENDPOINTS.GET_ALL);
  }

  create(tipo: Partial<TipoSupervisor>): Observable<TipoSupervisor> {
    return this.httpService.post<TipoSupervisor>(TIPO_SUPERVISOR_ENDPOINTS.CREATE, tipo);
  }

  update(id: number, tipo: Partial<TipoSupervisor>): Observable<TipoSupervisor> {
    return this.httpService.put<TipoSupervisor>(TIPO_SUPERVISOR_ENDPOINTS.UPDATE(id), tipo);
  }

  delete(id: number): Observable<void> {
    return this.httpService.delete<void>(TIPO_SUPERVISOR_ENDPOINTS.DELETE(id));
  }
}
