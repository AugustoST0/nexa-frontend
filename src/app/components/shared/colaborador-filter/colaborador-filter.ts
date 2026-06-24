import { Component, EventEmitter, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColaboradorService } from '../../../core/services/crud/colaborador-service';
import { ColaboradorFilterResponseDTO } from '../../../core/dto/ColaboradorFilterResponseDTO';
import { AdvancedSearchDTO } from '../../../core/dto/AdvancedSearchDTO';
import { SimpleSearchDTO } from '../../../core/dto/SimpleSearchDTO';
import { CommonSearchComponent } from '../common-search/common-search';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search';
import { ResultsTableComponent } from '../results-table/results-table';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';
import { RateLimiterService } from '../../../core/services/rate-limiter.service';

@Component({
  selector: 'app-colaborador-filter',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CommonSearchComponent,
    AdvancedSearchComponent,
    ResultsTableComponent,
  ],
  templateUrl: './colaborador-filter.html',
  styleUrls: ['./colaborador-filter.css'],
})
export class ColaboradorFilterComponent {
  private readonly colaboradorService = inject(ColaboradorService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly rateLimiter = inject(RateLimiterService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Output() gerenciarSupervisao = new EventEmitter<ColaboradorFilterResponseDTO>();
  @Output() buscaAtiva = new EventEmitter<boolean>();

  searchMode: 'common' | 'advanced' = 'common';
  resultados: ColaboradorFilterResponseDTO[] = [];
  loading: boolean = false;
  mensagem: string = '';
  commonSearchData: SimpleSearchDTO = {};
  advancedTokens: string[] = [];

  switchMode(mode: 'common' | 'advanced'): void {
    this.searchMode = mode;
    this.resultados = [];
    this.mensagem = '';
    this.commonSearchData = {};
    this.advancedTokens = [];
    this.buscaAtiva.emit(false);
  }

  onCommonSearch(criteria: SimpleSearchDTO): void {
    console.log('🔍 Iniciando busca comum com critérios:', criteria);
    
    // Verificar rate limiting
    if (!this.rateLimiter.canMakeRequest()) {
      const resetTime = this.rateLimiter.getResetTime();
      const now = new Date();
      const secondsUntilReset = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);
      this.mensagem = `Limite de requisições atingido. Aguarde ${secondsUntilReset} segundos. (${this.rateLimiter.getRemainingRequests()} requisições restantes)`;
      console.warn('⚠️ [COLABORADOR-FILTER] Rate limit atingido');
      return;
    }

    this.loading = true;
    this.mensagem = '';
    this.resultados = [];

    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      console.warn('⏰ Timeout na busca - forçando fim do loading');
      this.loading = false;
      this.mensagem = 'Timeout na busca - verifique a conexão com o servidor';
    }, 30000); // 30 segundos

    this.colaboradorService.searchCommon(criteria).subscribe({
      next: (results) => {
        clearTimeout(timeoutId);
        console.log('✅ [COLABORADOR-FILTER] Busca comum concluída');
        console.log('✅ [COLABORADOR-FILTER] Quantidade de resultados recebidos:', results.length);
        console.log('✅ [COLABORADOR-FILTER] Resultados:', results);
        
        this.resultados = results;
        if (results.length === 0) {
          this.mensagem = 'Nenhum colaborador encontrado';
        } else {
          this.mensagem = `${results.length} colaborador(es) encontrado(s)`;
        }
        this.buscaAtiva.emit(results.length > 0);
        this.loading = false;
        this.cdr.detectChanges(); // Força detecção de mudanças
      },
      error: (error) => {
        clearTimeout(timeoutId);
        console.error('❌ Erro na busca comum:', error);

        this.mensagem = this.errorHandler.getErrorMessage(error);
        this.buscaAtiva.emit(false);
        this.loading = false;
        this.cdr.detectChanges(); // Força detecção de mudanças
      },
    });
  }



  onCommonClear(): void {
    this.commonSearchData = {};
    this.resultados = [];
    this.mensagem = '';
    this.buscaAtiva.emit(false);
  }

  onAdvancedSearch(params: AdvancedSearchDTO): void {
    console.log('🔍 [COLABORADOR-FILTER] onAdvancedSearch chamado!');
    console.log('🔍 [COLABORADOR-FILTER] Parâmetros recebidos:', params);

    // Verificar rate limiting
    if (!this.rateLimiter.canMakeRequest()) {
      const resetTime = this.rateLimiter.getResetTime();
      const now = new Date();
      const secondsUntilReset = Math.ceil((resetTime.getTime() - now.getTime()) / 1000);
      this.mensagem = `Limite de requisições atingido. Aguarde ${secondsUntilReset} segundos. (${this.rateLimiter.getRemainingRequests()} requisições restantes)`;
      console.warn('⚠️ [COLABORADOR-FILTER] Rate limit atingido');
      return;
    }

    this.loading = true;
    this.mensagem = '';
    this.resultados = [];
    
    console.log('🔍 [COLABORADOR-FILTER] Loading ativado, fazendo requisição...');

    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      console.warn('⏰ Timeout na busca avançada - forçando fim do loading');
      this.loading = false;
      this.mensagem = 'Timeout na busca - verifique a conexão com o servidor';
    }, 30000); // 30 segundos

    this.colaboradorService.searchAdvanced(params).subscribe({
      next: (results) => {
        clearTimeout(timeoutId);
        console.log('✅ [COLABORADOR-FILTER] Busca avançada concluída');
        console.log('✅ [COLABORADOR-FILTER] Quantidade de resultados recebidos:', results.length);
        console.log('✅ [COLABORADOR-FILTER] Resultados:', results);
        
        this.resultados = results;
        if (results.length === 0) {
          this.mensagem = 'Nenhum colaborador encontrado com esses critérios';
        } else {
          this.mensagem = `${results.length} colaborador(es) encontrado(s)`;
        }
        this.buscaAtiva.emit(results.length > 0);
        this.loading = false;
        this.cdr.detectChanges(); // Força detecção de mudanças
      },
      error: (error) => {
        clearTimeout(timeoutId);
        console.error('❌ Erro na busca avançada:', error);

        this.mensagem = this.errorHandler.getErrorMessage(error);
        this.buscaAtiva.emit(false);
        this.loading = false;
        this.cdr.detectChanges(); // Força detecção de mudanças
      },
    });
  }

  onAdvancedClear(): void {
    this.advancedTokens = [];
    this.resultados = [];
    this.mensagem = '';
    this.buscaAtiva.emit(false);
  }

  onTokensChange(tokens: string[]): void {
    this.advancedTokens = tokens;
  }
}
