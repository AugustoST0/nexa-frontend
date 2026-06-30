import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpService } from '../http-service';
import { IMPORTACAO_ENDPOINTS } from '../../config/api-routes';
import { ImportPreview, LinhaImport, ImportResumo } from '../../model/Importacao.model';

@Injectable({
  providedIn: 'root',
})
export class ImportacaoService {
  private readonly http = inject(HttpClient);
  private readonly httpService = inject(HttpService);

  preview(file: File, delimitador = ';'): Observable<ImportPreview> {
    const fd = new FormData();
    fd.append('arquivo', file);
    fd.append('delimitador', delimitador);
    return this.http.post<ImportPreview>(IMPORTACAO_ENDPOINTS.PREVIEW, fd);
  }

  validar(linhas: Record<string, string>[]): Observable<LinhaImport[]> {
    return this.httpService.post<LinhaImport[]>(IMPORTACAO_ENDPOINTS.VALIDAR, linhas);
  }

  confirmar(linhas: LinhaImport[]): Observable<ImportResumo> {
    return this.httpService.post<ImportResumo>(IMPORTACAO_ENDPOINTS.CONFIRMAR, linhas);
  }
}
