import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Relatorio } from '../../model/Relatorio.model';
import { HttpService } from '../http-service';
import { RELATORIO_ENDPOINTS } from '../../config/api-routes';

@Injectable({
  providedIn: 'root',
})
export class RelatorioService {
  private readonly httpService = inject(HttpService);
  private readonly http = inject(HttpClient);

  getAll(): Observable<Relatorio[]> {
    return this.httpService.get<Relatorio[]>(RELATORIO_ENDPOINTS.GET_ALL);
  }

  gerar(grupoId: number): Observable<Relatorio> {
    return this.httpService.post<Relatorio>(RELATORIO_ENDPOINTS.GERAR(grupoId), {});
  }

  downloadCsv(id: number): Observable<Blob> {
    return this.http.get(RELATORIO_ENDPOINTS.DOWNLOAD_CSV(id), { responseType: 'blob' });
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.http.get(RELATORIO_ENDPOINTS.DOWNLOAD_PDF(id), { responseType: 'blob' });
  }
}
