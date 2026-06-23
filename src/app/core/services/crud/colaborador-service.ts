import { inject, Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Colaborador } from '../../model/Colaborador.model';
import { ColaboradorWithCalcs } from '../../model/ColaboradorWithCalcs.model';
import { ColaboradorCreateDTO } from '../../dto/ColaboradorCreateDTO';
import { ColaboradorUpdateDTO } from '../../dto/ColaboradorUpdateDTO';
import { SimpleSearchDTO } from '../../dto/SimpleSearchDTO';
import { AdvancedSearchDTO } from '../../dto/AdvancedSearchDTO';
import { ColaboradorFilterResponseDTO } from '../../dto/ColaboradorFilterResponseDTO';
import { HttpService } from '../http-service';
import { COLABORADOR_ENDPOINTS } from '../../config/api-routes';
import { SearchValidationService } from '../search-validation.service';
import { ErrorHandlerService } from '../error-handler.service';
import { RateLimiterService } from '../rate-limiter.service';
import { LocalStorageService } from '../local-storage-service';

@Injectable({
  providedIn: 'root',
})
export class ColaboradorService {
  private readonly httpService = inject(HttpService);
  private readonly validationService = inject(SearchValidationService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly rateLimiter = inject(RateLimiterService);
  private readonly localStorage = inject(LocalStorageService);

  // Métodos originais mantidos
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

  /**
   * Busca comum seguindo FRONTEND_INTEGRATION_GUIDE.md
   */
  searchCommon(criteria: SimpleSearchDTO): Observable<ColaboradorFilterResponseDTO[]> {
    return from(this.performCommonSearch(criteria));
  }

  private async performCommonSearch(criteria: SimpleSearchDTO): Promise<ColaboradorFilterResponseDTO[]> {
    // 1. Verificar rate limiting
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Muitas requisições. Tente novamente em alguns segundos.');
    }

    // 2. Validar autenticação
    this.validateAuthToken();

    // 3. Validar parâmetros
    this.validationService.validateCommonSearchParams(criteria);

    // 4. Sanitizar entrada
    const sanitizedParams = this.validationService.sanitizeParams(criteria);

    // 5. Construir query string
    const queryString = new URLSearchParams();
    if (sanitizedParams.nome) queryString.append('nome', sanitizedParams.nome);
    if (sanitizedParams.matricula) queryString.append('matricula', sanitizedParams.matricula);
    if (sanitizedParams.email) queryString.append('email', sanitizedParams.email);
    if (sanitizedParams.cpf) queryString.append('cpf', sanitizedParams.cpf);
    if (sanitizedParams.cargo) queryString.append('cargo', sanitizedParams.cargo);

    // 6. Fazer requisição
    const url = `${COLABORADOR_ENDPOINTS.SEARCH_COMMON}?${queryString.toString()}`;
    console.log('🌐 [COLABORADOR-SERVICE] Fazendo busca comum');
    console.log('🌐 [COLABORADOR-SERVICE] URL:', url);
    console.log('🌐 [COLABORADOR-SERVICE] Parâmetros sanitizados:', sanitizedParams);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Accept': 'application/json'
        }
      });

      console.log('🌐 [COLABORADOR-SERVICE] Status da resposta:', response.status);

      if (!response.ok) {
        throw await this.errorHandler.handleErrorResponse(response);
      }

      const data = await response.json();
      console.log('✅ [COLABORADOR-SERVICE] Dados recebidos:', data);
      console.log('✅ [COLABORADOR-SERVICE] Quantidade de resultados:', data.length);
      
      return data;
    } catch (error) {
      console.error('❌ Erro na busca comum:', error);
      throw this.errorHandler.handleNetworkError(error);
    }
  }

  /**
   * Busca avançada seguindo FRONTEND_INTEGRATION_GUIDE.md
   */
  searchAdvanced(searchDTO: AdvancedSearchDTO): Observable<ColaboradorFilterResponseDTO[]> {
    return from(this.performAdvancedSearch(searchDTO));
  }

  private async performAdvancedSearch(searchDTO: AdvancedSearchDTO): Promise<ColaboradorFilterResponseDTO[]> {
    // 1. Verificar rate limiting
    if (!this.rateLimiter.canMakeRequest()) {
      throw new Error('Muitas requisições. Tente novamente em alguns segundos.');
    }

    // 2. Validar autenticação
    this.validateAuthToken();

    // 3. Validar/sanitizar tokens (podem estar ausentes quando a busca usa só filtros extras)
    const tokens = searchDTO.tokens ?? [];
    let sanitizedTokens: string[] = [];
    if (tokens.length > 0) {
      this.validationService.validateTokens(tokens);
      sanitizedTokens = this.validationService.sanitizeTokens(tokens);
    }

    // 4. Preparar body da requisição (inclui filtros opcionais quando definidos)
    const requestBody: AdvancedSearchDTO = {
      tokens: sanitizedTokens,
      supervisorIds: searchDTO.supervisorIds,
      dataAdmissaoInicio: searchDTO.dataAdmissaoInicio,
      dataAdmissaoFim: searchDTO.dataAdmissaoFim,
    };

    // 6. Fazer requisição
    const url = COLABORADOR_ENDPOINTS.SEARCH_ADVANCED;
    console.log('🌐 [COLABORADOR-SERVICE] Fazendo busca avançada');
    console.log('🌐 [COLABORADOR-SERVICE] URL:', url);
    console.log('🌐 [COLABORADOR-SERVICE] Tokens sanitizados:', sanitizedTokens);
    console.log('🌐 [COLABORADOR-SERVICE] Body da requisição:', JSON.stringify(requestBody));

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('🌐 [COLABORADOR-SERVICE] Status da resposta:', response.status);

      if (!response.ok) {
        throw await this.errorHandler.handleErrorResponse(response);
      }

      const data = await response.json();
      console.log('✅ [COLABORADOR-SERVICE] Dados recebidos:', data);
      console.log('✅ [COLABORADOR-SERVICE] Quantidade de resultados:', data.length);
      
      return data;
    } catch (error) {
      console.error('❌ Erro na busca avançada:', error);
      throw this.errorHandler.handleNetworkError(error);
    }
  }

  /**
   * Buscar supervisores seguindo FRONTEND_INTEGRATION_GUIDE.md
   */
  getSupervisores(): Observable<ColaboradorFilterResponseDTO[]> {
    return from(this.performGetSupervisores());
  }

  private async performGetSupervisores(): Promise<ColaboradorFilterResponseDTO[]> {
    this.validateAuthToken();

    const url = COLABORADOR_ENDPOINTS.GET_SUPERVISORES;
    console.log('🌐 Buscando supervisores:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw await this.errorHandler.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar supervisores:', error);
      throw this.errorHandler.handleNetworkError(error);
    }
  }

  /**
   * Buscar por tag específica seguindo FRONTEND_INTEGRATION_GUIDE.md
   */
  getByTag(tagId: number): Observable<ColaboradorFilterResponseDTO[]> {
    return from(this.performGetByTag(tagId));
  }

  private async performGetByTag(tagId: number): Promise<ColaboradorFilterResponseDTO[]> {
    this.validationService.validateTagId(tagId);
    this.validateAuthToken();

    const url = COLABORADOR_ENDPOINTS.GET_BY_TAG(tagId);
    console.log('🌐 Buscando por tag:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw await this.errorHandler.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro ao buscar por tag:', error);
      throw this.errorHandler.handleNetworkError(error);
    }
  }

  /**
   * Busca simples por nome seguindo FRONTEND_INTEGRATION_GUIDE.md
   */
  searchByNome(nome: string): Observable<ColaboradorFilterResponseDTO[]> {
    return from(this.performSearchByNome(nome));
  }

  private async performSearchByNome(nome: string): Promise<ColaboradorFilterResponseDTO[]> {
    this.validationService.validateNomeSearch(nome);
    this.validateAuthToken();

    const sanitizedNome = nome.trim().replace(/[<>"';()&+\\]/g, '');
    const url = `${COLABORADOR_ENDPOINTS.SEARCH_BY_NAME(encodeURIComponent(sanitizedNome))}`;
    console.log('🌐 Busca simples por nome:', url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw await this.errorHandler.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro na busca por nome:', error);
      throw this.errorHandler.handleNetworkError(error);
    }
  }

  /**
   * Valida token de autenticação
   */
  private validateAuthToken(): void {
    const token = this.getToken();

    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    // Verificar se o token não está expirado
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        throw new Error('Token de autenticação expirado');
      }
    } catch (error) {
      throw new Error('Token de autenticação inválido');
    }
  }

  /**
   * Obtém token de autenticação
   */
  private getToken(): string {
    return this.localStorage.getAccessToken() || '';
  }
}
