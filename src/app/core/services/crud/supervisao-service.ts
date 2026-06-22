import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Supervisao, TipoSupervisor } from '../../model/Supervisao.model';
import { HttpService } from '../http-service';
import { SUPERVISAO_ENDPOINTS, TIPO_SUPERVISOR_ENDPOINTS } from '../../config/api-routes';

@Injectable({
  providedIn: 'root',
})
export class SupervisaoService {
  private readonly httpService = inject(HttpService);

  getSupervisoesPorColaborador(id: number): Observable<Supervisao[]> {
    return this.httpService.get<Supervisao[]>(SUPERVISAO_ENDPOINTS.GET_POR_COLABORADOR(id));
  }

  getSupervisoesPorSupervisor(id: number): Observable<Supervisao[]> {
    return this.httpService.get<Supervisao[]>(SUPERVISAO_ENDPOINTS.GET_POR_SUPERVISOR(id));
  }

  getHistoricoPorColaborador(id: number): Observable<Supervisao[]> {
    return this.httpService.get<Supervisao[]>(SUPERVISAO_ENDPOINTS.GET_HISTORICO_POR_COLABORADOR(id));
  }

  create(supervisao: {
    supervisor: { id: number };
    supervisionado: { id: number };
    tipoSupervisor: { id: number };
    dataInicio: string;
    observacoes?: string;
  }): Observable<Supervisao> {
    return this.httpService.post<Supervisao>(SUPERVISAO_ENDPOINTS.CREATE, supervisao);
  }

  encerrar(id: number): Observable<void> {
    return this.httpService.put<void>(SUPERVISAO_ENDPOINTS.ENCERRAR(id), {});
  }

  trocarSupervisor(dto: {
    colaboradorId: number;
    novoSupervisorId: number;
    tipoSupervisorId: number;
    motivo?: string;
  }): Observable<void> {
    return this.httpService.post<void>(SUPERVISAO_ENDPOINTS.TROCAR, dto);
  }

  migrarTodos(dto: {
    supervisorAntigoId: number;
    supervisorNovoId: number;
    tipoSupervisorId?: number;
    motivo?: string;
  }): Observable<void> {
    return this.httpService.post<void>(SUPERVISAO_ENDPOINTS.MIGRAR_TODOS, dto);
  }

  getTipos(): Observable<TipoSupervisor[]> {
    return this.httpService.get<TipoSupervisor[]>(TIPO_SUPERVISOR_ENDPOINTS.GET_ALL);
  }
}
