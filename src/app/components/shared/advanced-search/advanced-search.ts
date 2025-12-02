import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagService } from '../../../core/services/crud/tag-service';
import { GrupoService } from '../../../core/services/crud/grupo-service';
import { SearchValidationService } from '../../../core/services/search-validation.service';
import { ErrorHandlerService } from '../../../core/services/error-handler.service';

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advanced-search.html',
  styleUrls: ['./advanced-search.css'],
})
export class AdvancedSearchComponent {
  @Input() tokens: string[] = [];
  @Output() tokensChange = new EventEmitter<string[]>();
  @Output() search = new EventEmitter<string[]>();
  @Output() clear = new EventEmitter<void>();

  private readonly tagService = inject(TagService);
  private readonly grupoService = inject(GrupoService);
  private readonly validationService = inject(SearchValidationService);
  private readonly errorHandler = inject(ErrorHandlerService);

  allTags: string[] = [];
  allGrupos: string[] = [];
  grupoTagsMap: Map<string, string[]> = new Map();
  filteredTags: string[] = [];
  filteredGrupos: string[] = [];
  tagSearchInput: string = '';
  grupoSearchInput: string = '';
  showTagDropdown: boolean = false;
  showGrupoDropdown: boolean = false;
  showOperatorDropdown: boolean = false;
  validationMessage: string = '';
  operatorValidationMessage: string = '';
  tagsLoading: boolean = false;
  gruposLoading: boolean = false;
  searchMode: 'tags' | 'grupos' = 'tags';

  operators = ['E', 'OU', 'NÃO POSSUI'];

  ngOnInit(): void {
    // Carregar tags apenas quando o dropdown for aberto
  }

  loadTags(): void {
    if (this.allTags.length > 0) {
      return; // Já foram carregadas
    }

    this.tagsLoading = true;
    this.tagService.getAll().subscribe({
      next: (tags) => {
        this.allTags = tags.map((tag) => tag.nome);
        this.filteredTags = this.allTags;
        this.tagsLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar tags:', error);
        this.allTags = [];
        this.filteredTags = [];
        this.tagsLoading = false;
      },
    });
  }

  loadGrupos(): void {
    if (this.allGrupos.length > 0) {
      return; // Já foram carregadas
    }

    this.gruposLoading = true;
    this.grupoService.getAll().subscribe({
      next: (grupos) => {
        this.allGrupos = grupos.map((grupo) => grupo.nome);
        this.filteredGrupos = this.allGrupos;
        
        // Carregar tags de cada grupo
        grupos.forEach((grupo) => {
          this.tagService.getByGrupoId(grupo.id!).subscribe({
            next: (tags) => {
              const tagNames = tags.map((tag) => tag.nome);
              this.grupoTagsMap.set(grupo.nome, tagNames);
            },
            error: (error) => {
              console.error(`Erro ao carregar tags do grupo ${grupo.nome}:`, error);
              this.grupoTagsMap.set(grupo.nome, []);
            },
          });
        });
        
        this.gruposLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar grupos:', error);
        this.allGrupos = [];
        this.filteredGrupos = [];
        this.gruposLoading = false;
      },
    });
  }

  onTagSearchChange(value: string): void {
    this.tagSearchInput = value;
    this.filteredTags = this.allTags.filter((tag) =>
      tag.toLowerCase().includes(value.toLowerCase())
    );
  }

  onGrupoSearchChange(value: string): void {
    this.grupoSearchInput = value;
    this.filteredGrupos = this.allGrupos.filter((grupo) =>
      grupo.toLowerCase().includes(value.toLowerCase())
    );
  }

  addTag(tag: string): void {
    this.tokens = [...this.tokens, tag];
    this.tagSearchInput = '';
    this.filteredTags = this.allTags;
    this.showTagDropdown = false;
    this.tokensChange.emit(this.tokens);
    this.validationMessage = '';
  }

  addGrupo(grupo: string): void {
    this.tokens = [...this.tokens, `Grupo:${grupo}`];
    this.grupoSearchInput = '';
    this.filteredGrupos = this.allGrupos;
    this.showGrupoDropdown = false;
    this.tokensChange.emit(this.tokens);
    this.validationMessage = '';
  }

  addOperator(operator: string): void {
    if (this.tokens.length === 0) {
      this.operatorValidationMessage =
        'Selecione uma tag antes de adicionar um operador';
      this.showOperatorDropdown = false;
      return;
    }

    const lastToken = this.tokens[this.tokens.length - 1];
    if (this.operators.includes(lastToken)) {
      this.operatorValidationMessage =
        'Não é possível adicionar um operador após outro operador. Selecione uma tag primeiro.';
      this.showOperatorDropdown = false;
      return;
    }

    this.tokens = [...this.tokens, operator];
    this.showOperatorDropdown = false;
    this.tokensChange.emit(this.tokens);
    this.operatorValidationMessage = '';
  }

  removeToken(index: number): void {
    this.tokens = this.tokens.filter((_, i) => i !== index);
    this.tokensChange.emit(this.tokens);
  }

  onSearch(): void {
    console.log('🔍 [ADVANCED-SEARCH] Botão Buscar clicado! Tokens:', this.tokens);
    
    // Verificar se há tokens selecionados
    if (this.tokens.length === 0) {
      this.validationMessage = 'Selecione pelo menos uma tag ou grupo para buscar';
      console.warn('⚠️ [ADVANCED-SEARCH] Nenhum token selecionado');
      return;
    }
    
    try {
      // Validar tokens
      this.validationService.validateTokens(this.tokens);
      this.validationMessage = '';
      
      console.log('✅ [ADVANCED-SEARCH] Validação OK. Emitindo evento search com tokens:', this.tokens);
      
      // Emitir os tokens originais (sem expandir grupos)
      // A expansão será feita no backend
      this.search.emit(this.tokens);
    } catch (error: any) {
      console.error('❌ [ADVANCED-SEARCH] Erro na validação:', error);
      this.validationMessage = this.errorHandler.getErrorMessage(error);
    }
  }

  private expandGruposInTokens(tokens: string[]): string[] {
    const expandedTokens: string[] = [];
    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];

      if (token.startsWith('Grupo:')) {
        const grupoName = token.substring(6); // Remove "Grupo:" prefix
        const grupoTags = this.getGrupoTags(grupoName);

        // Verificar se o próximo token é "NÃO POSSUI"
        if (i + 1 < tokens.length && tokens[i + 1] === 'NÃO POSSUI') {
          // Caso: Tag NÃO POSSUI Grupo
          // Adicionar o token anterior (tag) se existir
          if (expandedTokens.length > 0) {
            // Adicionar "NÃO POSSUI" seguido de todas as tags do grupo com "E"
            expandedTokens.push('NÃO POSSUI');
            grupoTags.forEach((tag, index) => {
              expandedTokens.push(tag);
              if (index < grupoTags.length - 1) {
                expandedTokens.push('E');
              }
            });
            i += 2; // Pular o token "Grupo:" e "NÃO POSSUI"
            continue;
          }
        } else {
          // Caso normal: Grupo é tratado como agregação de tags
          grupoTags.forEach((tag, index) => {
            expandedTokens.push(tag);
            if (index < grupoTags.length - 1) {
              expandedTokens.push('E');
            }
          });
        }
      } else {
        expandedTokens.push(token);
      }

      i++;
    }

    return expandedTokens;
  }

  private getGrupoTags(grupoName: string): string[] {
    return this.grupoTagsMap.get(grupoName) || [];
  }

  onClear(): void {
    this.tokens = [];
    this.tagSearchInput = '';
    this.validationMessage = '';
    this.operatorValidationMessage = '';
    this.filteredTags = this.allTags;
    this.showTagDropdown = false;
    this.showOperatorDropdown = false;
    this.tokensChange.emit(this.tokens);
    this.clear.emit();
  }

  getAvailableTags(): string[] {
    return this.allTags.filter((tag) => !this.tokens.includes(tag));
  }

  toggleTagDropdown(): void {
    this.showTagDropdown = !this.showTagDropdown;
    this.showGrupoDropdown = false;
    this.showOperatorDropdown = false;
    if (this.showTagDropdown) {
      if (this.allTags.length === 0) {
        this.loadTags();
      }
      this.filteredTags = this.allTags.filter(
        (tag) => !this.tokens.includes(tag)
      );
    }
  }

  toggleGrupoDropdown(): void {
    this.showGrupoDropdown = !this.showGrupoDropdown;
    this.showTagDropdown = false;
    this.showOperatorDropdown = false;
    if (this.showGrupoDropdown) {
      if (this.allGrupos.length === 0) {
        this.loadGrupos();
      }
      this.filteredGrupos = this.allGrupos.filter(
        (grupo) => !this.tokens.includes(`Grupo:${grupo}`)
      );
    }
  }

  toggleOperatorDropdown(): void {
    this.showOperatorDropdown = !this.showOperatorDropdown;
    this.showTagDropdown = false;
    this.showGrupoDropdown = false;
  }

  closeDropdowns(): void {
    this.showTagDropdown = false;
    this.showGrupoDropdown = false;
    this.showOperatorDropdown = false;
  }
}
