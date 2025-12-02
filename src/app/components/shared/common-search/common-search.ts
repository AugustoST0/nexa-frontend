import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SimpleSearchDTO } from '../../../core/dto/SimpleSearchDTO';
import { SearchValidationService } from '../../../core/services/search-validation.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-common-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './common-search.html',
  styleUrls: ['./common-search.css'],
})
export class CommonSearchComponent {
  private readonly validationService = inject(SearchValidationService);
  private readonly errorHandler = inject(ErrorHandlerService);

  @Input() searchData: SimpleSearchDTO = {};
  @Output() search = new EventEmitter<SimpleSearchDTO>();
  @Output() clear = new EventEmitter<void>();

  validationMessage: string = '';

  onSearch(): void {
    console.log('🔍 [COMMON-SEARCH] Botão Buscar clicado!');
    console.log('🔍 [COMMON-SEARCH] Dados de busca:', this.searchData);
    
    try {
      // Usar o serviço de validação seguindo FRONTEND_INTEGRATION_GUIDE.md
      this.validationService.validateCommonSearchParams(this.searchData);
      this.validationMessage = '';
      
      // Sanitizar dados antes de enviar
      const sanitizedData = this.validationService.sanitizeParams(this.searchData);
      
      console.log('✅ [COMMON-SEARCH] Validação OK. Emitindo evento search com dados:', sanitizedData);
      this.search.emit(sanitizedData);
    } catch (error: any) {
      console.error('❌ [COMMON-SEARCH] Erro na validação:', error);
      this.validationMessage = this.errorHandler.getErrorMessage(error);
    }
  }

  onClear(): void {
    this.searchData = {};
    this.validationMessage = '';
    this.clear.emit();
  }
}
