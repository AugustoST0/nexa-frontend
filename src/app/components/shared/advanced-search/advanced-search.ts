import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save } from 'lucide-angular';
import { TagService } from '../../../core/services/crud/tag-service';
import { GrupoService } from '../../../core/services/crud/grupo-service';
import { ColaboradorService } from '../../../core/services/crud/colaborador-service';
import { AlertService } from '../../../core/services/alert-service';
import { ModalService } from '../../../core/services/modal-service';
import { Tag } from '../../../core/model/Tag.model';
import { Grupo } from '../../../core/model/Grupo.model';
import { ColaboradorWithCalcs } from '../../../core/model/ColaboradorWithCalcs.model';
import { AdvancedSearchDTO } from '../../../core/dto/AdvancedSearchDTO';
import { SearchableSelectComponent } from '../searchable-select/searchable-select';

const OPERADORES = ['E', 'OU', 'NÃO POSSUI'];

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, SearchableSelectComponent],
  templateUrl: './advanced-search.html',
  styleUrls: ['./advanced-search.css'],
})
export class AdvancedSearchComponent implements OnInit {
  @Input() tokens: string[] = [];
  @Output() tokensChange = new EventEmitter<string[]>();
  @Output() search = new EventEmitter<AdvancedSearchDTO>();
  @Output() clear = new EventEmitter<void>();

  private readonly tagService = inject(TagService);
  private readonly grupoService = inject(GrupoService);
  private readonly colaboradorService = inject(ColaboradorService);
  private readonly alertService = inject(AlertService);
  private readonly modalService = inject(ModalService);

  readonly Save = Save;
  readonly operadores = OPERADORES;

  allTags = signal<Tag[]>([]);
  tokensAvancados = signal<string[]>([]);
  showTagSelect = signal(false);
  showOperadorButtons = signal(false);
  tagSelectValue = signal('');
  pesquisasSalvas = signal<Grupo[]>([]);

  // Filtros adicionais (opcionais)
  colaboradores = signal<ColaboradorWithCalcs[]>([]);
  buscaSupervisorId = signal('');
  buscaDataInicio = signal('');
  buscaDataFim = signal('');

  supervisorOptions = computed(() =>
    this.colaboradores().map((c) => ({ value: c.id!, label: c.nome }))
  );

  hasExtraFiltro = computed(() =>
    !!this.buscaSupervisorId() || !!this.buscaDataInicio() || !!this.buscaDataFim()
  );

  tagSelectOptions = computed(() =>
    this.allTags().map((t) => ({ value: t.nome, label: t.nome }))
  );

  canAddTag = computed(() => {
    const tokens = this.tokensAvancados();
    return tokens.length === 0 || this.isOperador(tokens[tokens.length - 1]);
  });

  canAddOperador = computed(() => {
    const tokens = this.tokensAvancados();
    return tokens.length > 0 && !this.isOperador(tokens[tokens.length - 1]);
  });

  canSearch = computed(() => {
    const tokens = this.tokensAvancados();
    const tokensValidos = tokens.length >= 1 && !this.isOperador(tokens[tokens.length - 1]);
    return tokensValidos || (tokens.length === 0 && this.hasExtraFiltro());
  });

  canSave = computed(() => {
    const tokens = this.tokensAvancados();
    const tokensValidos = tokens.length >= 3 && !this.isOperador(tokens[tokens.length - 1]);
    return tokensValidos || (tokens.length === 0 && this.hasExtraFiltro());
  });

  ngOnInit(): void {
    this.tokensAvancados.set(this.tokens ?? []);
    this.loadTags();
    this.loadPesquisasSalvas();
    this.loadColaboradores();
  }

  loadColaboradores(): void {
    this.colaboradorService.getAll().subscribe({
      next: (colaboradores) => this.colaboradores.set(colaboradores),
      error: (error) => {
        console.error('Erro ao carregar colaboradores:', error);
        this.colaboradores.set([]);
      },
    });
  }

  loadPesquisasSalvas(): void {
    this.grupoService.getAll().subscribe({
      next: (grupos) => {
        const recentes = grupos
          .filter((g) => g.tokens && g.tokens.length > 0)
          .sort((a, b) => {
            if (!a.criadoEm && !b.criadoEm) return 0;
            if (!a.criadoEm) return 1;
            if (!b.criadoEm) return -1;
            return b.criadoEm.localeCompare(a.criadoEm);
          })
          .slice(0, 5);
        this.pesquisasSalvas.set(recentes);
      },
      error: (error) => {
        console.error('Erro ao carregar pesquisas salvas:', error);
        this.pesquisasSalvas.set([]);
      },
    });
  }

  selecionarPesquisa(id: string): void {
    if (!id) return;
    const grupo = this.pesquisasSalvas().find((g) => String(g.id) === id);
    if (!grupo) return;

    if (this.tokensAvancados().length === 0) {
      this.aplicarPesquisa(grupo);
      return;
    }

    this.modalService
      .showConfirm({
        title: 'Substituir busca',
        message: 'Substituir a busca atual pelos tokens desta pesquisa?',
        confirmText: 'Substituir',
        cancelText: 'Cancelar',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.aplicarPesquisa(grupo);
        }
      });
  }

  private aplicarPesquisa(grupo: Grupo): void {
    this.tokensAvancados.set([...(grupo.tokens ?? [])]);
    this.tokensChange.emit(this.tokensAvancados());
  }

  salvarPesquisa(): void {
    if (!this.canSave()) return;

    const partes: string[] = [];
    if (this.tokensAvancados().length > 0) partes.push(this.tokensAvancados().join(' '));
    if (this.buscaSupervisorId()) {
      const sup = this.colaboradores().find((c) => c.id === Number(this.buscaSupervisorId()));
      if (sup) partes.push(`Supervisor: ${sup.nome}`);
    }
    if (this.buscaDataInicio()) partes.push(`Admitido após: ${this.buscaDataInicio()}`);
    if (this.buscaDataFim()) partes.push(`Admitido até: ${this.buscaDataFim()}`);
    const nome = partes.join(' | ') || 'Pesquisa personalizada';

    const payload = {
      nome,
      tokens: this.tokensAvancados(),
      supervisorId: this.buscaSupervisorId() ? Number(this.buscaSupervisorId()) : undefined,
      dataAdmissaoInicio: this.buscaDataInicio() || undefined,
      dataAdmissaoFim: this.buscaDataFim() || undefined,
    };
    // DEBUG temporário — remover após validar
    console.log('[DEBUG salvarPesquisa] payload:', payload);

    this.grupoService.create(payload).subscribe({
      next: () => {
        this.alertService.success('Pesquisa salva com sucesso');
        this.loadPesquisasSalvas();
      },
      error: (error) => {
        this.alertService.error('Erro ao salvar pesquisa');
        console.error('Erro ao salvar pesquisa:', error);
      },
    });
  }

  isOperador(token: string): boolean {
    return OPERADORES.includes(token);
  }

  loadTags(): void {
    this.tagService.getAll().subscribe({
      next: (tags) => this.allTags.set(tags),
      error: (error) => {
        console.error('Erro ao carregar tags:', error);
        this.allTags.set([]);
      },
    });
  }

  toggleTagSelect(): void {
    this.showTagSelect.update((v) => !v);
    this.showOperadorButtons.set(false);
  }

  toggleOperadorButtons(): void {
    this.showOperadorButtons.update((v) => !v);
    this.showTagSelect.set(false);
  }

  addTagToken(nome: string): void {
    if (!nome || !this.canAddTag()) return;
    this.tokensAvancados.update((t) => [...t, nome]);
    this.showTagSelect.set(false);
    this.tagSelectValue.set('');
    this.tokensChange.emit(this.tokensAvancados());
  }

  addOperadorToken(op: string): void {
    if (!this.canAddOperador()) return;
    this.tokensAvancados.update((t) => [...t, op]);
    this.showOperadorButtons.set(false);
    this.tokensChange.emit(this.tokensAvancados());
  }

  removeToken(index: number): void {
    this.tokensAvancados.update((t) => t.filter((_, i) => i !== index));
    this.tokensChange.emit(this.tokensAvancados());
  }

  onSearch(): void {
    if (!this.canSearch()) return;
    this.search.emit({
      tokens: this.tokensAvancados(),
      supervisorId: this.buscaSupervisorId() ? Number(this.buscaSupervisorId()) : undefined,
      dataAdmissaoInicio: this.buscaDataInicio() || undefined,
      dataAdmissaoFim: this.buscaDataFim() || undefined,
    });
  }

  onClear(): void {
    this.tokensAvancados.set([]);
    this.showTagSelect.set(false);
    this.showOperadorButtons.set(false);
    this.tagSelectValue.set('');
    this.buscaSupervisorId.set('');
    this.buscaDataInicio.set('');
    this.buscaDataFim.set('');
    this.tokensChange.emit([]);
    this.clear.emit();
  }
}
