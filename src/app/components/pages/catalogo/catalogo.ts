import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { LucideAngularModule, Edit, Trash2, Plus, Search, FileText, X } from 'lucide-angular';
import { GrupoService } from '../../../core/services/crud/grupo-service';
import { TagService } from '../../../core/services/crud/tag-service';
import { ColaboradorService } from '../../../core/services/crud/colaborador-service';
import { RelatorioService } from '../../../core/services/crud/relatorio-service';
import { AlertService } from '../../../core/services/alert-service';
import { ModalService } from '../../../core/services/modal-service';
import { Grupo } from '../../../core/model/Grupo.model';
import { Tag } from '../../../core/model/Tag.model';
import { Relatorio } from '../../../core/model/Relatorio.model';
import { ColaboradorFilterResponseDTO } from '../../../core/dto/ColaboradorFilterResponseDTO';
import { ColaboradorWithCalcs } from '../../../core/model/ColaboradorWithCalcs.model';
import { FormModalConfig } from '../../../core/model/FormModalConfig.model';
import { isPesquisaSalva } from '../../../core/utils/grupo.util';
import { ButtonComponent } from '../../ui/button/button';
import { CardComponent } from '../../ui/card/card';
import { BadgeComponent } from '../../ui/badge/badge';
import { MultiSelectComponent } from '../../shared/multi-select/multi-select';
import { SearchableSelectComponent } from '../../shared/searchable-select/searchable-select';

const OPERADORES = ['E', 'OU', 'NÃO POSSUI'];

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, CardComponent, BadgeComponent, MultiSelectComponent, SearchableSelectComponent],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalogo implements OnInit {
  private readonly grupoService = inject(GrupoService);
  private readonly tagService = inject(TagService);
  private readonly colaboradorService = inject(ColaboradorService);
  private readonly relatorioService = inject(RelatorioService);
  private readonly alertService = inject(AlertService);
  private readonly modalService = inject(ModalService);
  private readonly route = inject(ActivatedRoute);

  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;
  readonly Search = Search;
  readonly FileText = FileText;
  readonly X = X;

  readonly operadores = OPERADORES;

  activeTab = signal<'tags' | 'pesquisas'>('tags');

  allTags = signal<Tag[]>([]);
  pesquisas = signal<Grupo[]>([]);
  relatorios = signal<Relatorio[]>([]);
  loading = signal(false);
  tagSearch = signal('');

  filteredTags = computed(() => {
    const term = this.tagSearch().trim().toLowerCase();
    const tags = this.allTags();
    if (!term) return tags;
    return tags.filter((t) => t.nome.toLowerCase().includes(term));
  });

  tagSelectOptions = computed(() =>
    this.allTags().map((t) => ({ value: t.nome, label: t.nome }))
  );

  // Modal "Nova Pesquisa"
  showNewSearch = signal(false);
  newTokens = signal<string[]>([]);
  showTagSelect = signal(false);
  showOperadorButtons = signal(false);
  tagSelectValue = signal('');
  formNomePesquisa = signal('');

  // Filtros adicionais (opcionais)
  colaboradores = signal<ColaboradorWithCalcs[]>([]);
  formSupervisorIds = signal<number[]>([]);
  formDataInicio = signal('');
  formDataFim = signal('');

  supervisorOptions = computed(() =>
    this.colaboradores().map((c) => ({ value: c.id!, label: c.nome }))
  );

  hasExtraFiltro = computed(() =>
    this.formSupervisorIds().length > 0 || !!this.formDataInicio() || !!this.formDataFim()
  );

  canAddTag = computed(() => {
    const tokens = this.newTokens();
    return tokens.length === 0 || this.isOperador(tokens[tokens.length - 1]);
  });

  canAddOperador = computed(() => {
    const tokens = this.newTokens();
    return tokens.length > 0 && !this.isOperador(tokens[tokens.length - 1]);
  });

  canSave = computed(() => {
    const tokens = this.newTokens();
    const tokensValidos = tokens.length >= 3 && !this.isOperador(tokens[tokens.length - 1]);
    return tokensValidos || (tokens.length === 0 && this.hasExtraFiltro());
  });

  previewNome = computed(() => this.newTokens().join(' '));

  // Modal "Ver Pesquisa"
  showSavedSearch = signal(false);
  selectedPesquisa = signal<Grupo | null>(null);
  searchResults = signal<ColaboradorFilterResponseDTO[] | null>(null);
  searching = signal(false);

  ngOnInit() {
    if (this.route.snapshot.queryParamMap.get('tab') === 'pesquisas') {
      this.activeTab.set('pesquisas');
    }
    this.loadAllTags();
    this.loadPesquisas();
    this.loadColaboradores();
    this.loadRelatorios();
  }

  loadColaboradores() {
    this.colaboradorService.getAll().subscribe({
      next: (colaboradores) => this.colaboradores.set(colaboradores),
      error: (err) => console.error('Erro ao carregar colaboradores', err),
    });
  }

  loadRelatorios() {
    this.relatorioService.getAll().subscribe({
      next: (relatorios) => this.relatorios.set(relatorios),
      error: (err) => console.error('Erro ao carregar relatórios', err),
    });
  }

  ultimaExecucao(grupoId: number): string | null {
    const relsDoPesquisa = this.relatorios()
      .filter((r) => r.grupoId === grupoId)
      .sort((a, b) => new Date(b.geradoEm).getTime() - new Date(a.geradoEm).getTime());
    if (relsDoPesquisa.length === 0) return null;
    const d = new Date(relsDoPesquisa[0].geradoEm);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  supervisorNome(id?: number): string {
    if (!id) return '';
    const c = this.colaboradores().find((c) => c.id === id);
    return c ? c.nome : `#${id}`;
  }

  formatarDataAdmissao(iso?: string): string {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  formatarData(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR') + ' às ' +
      d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  relatoriosDoPesquisa(grupoId: number): Relatorio[] {
    return this.relatorios()
      .filter((r) => r.grupoId === grupoId)
      .sort((a, b) => new Date(b.geradoEm).getTime() - new Date(a.geradoEm).getTime());
  }

  downloadCsv(id: number): void {
    this.relatorioService.downloadCsv(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${id}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.alertService.error('Erro ao baixar CSV'),
    });
  }

  downloadPdf(id: number): void {
    this.relatorioService.downloadPdf(id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-${id}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.alertService.error('Erro ao baixar PDF'),
    });
  }

  isOperador(token: string): boolean {
    return OPERADORES.includes(token);
  }

  loadAllTags() {
    this.tagService.getAll().subscribe({
      next: (tags) => this.allTags.set(tags),
      error: (err) => {
        this.alertService.error('Erro ao carregar tags');
        console.error(err);
      },
    });
  }

  loadPesquisas() {
    this.loading.set(true);
    this.grupoService.getAll().subscribe({
      next: (grupos) => {
        this.pesquisas.set(grupos.filter(isPesquisaSalva));
        this.loading.set(false);
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar pesquisas');
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  // ===== Aba Tags (CRUD via ModalService) =====
  onNewTag() {
    const config: FormModalConfig = {
      title: 'Nova Tag',
      fields: [
        { name: 'nome', label: 'Nome', type: 'text', placeholder: 'Ex: Java, Liderança, etc.', required: true, maxLength: 100 },
        { name: 'descricao', label: 'Descrição', type: 'textarea', placeholder: 'Descrição opcional da tag', rows: 3, maxLength: 500 },
      ],
      submitText: 'Criar',
      cancelText: 'Cancelar',
    };

    this.modalService.showForm(config).subscribe({
      next: (data) => {
        if (data) {
          this.tagService.create(data).subscribe({
            next: () => {
              this.alertService.success('Tag criada com sucesso');
              this.loadAllTags();
            },
            error: (err) => {
              this.alertService.error('Erro ao criar tag');
              console.error(err);
            },
          });
        }
      },
    });
  }

  onEditTag(tag: Tag) {
    const config: FormModalConfig = {
      title: 'Editar Tag',
      fields: [
        { name: 'nome', label: 'Nome', type: 'text', value: tag.nome, placeholder: 'Ex: Python, Java, etc.', required: true, maxLength: 100 },
        { name: 'descricao', label: 'Descrição', type: 'textarea', value: tag.descricao || '', placeholder: 'Descrição opcional da tag', rows: 3, maxLength: 500 },
      ],
      submitText: 'Atualizar',
      cancelText: 'Cancelar',
    };

    this.modalService.showForm(config).subscribe({
      next: (data) => {
        if (data) {
          this.tagService.update(tag.id!, data).subscribe({
            next: () => {
              this.alertService.success('Tag atualizada com sucesso');
              this.loadAllTags();
            },
            error: (err) => {
              this.alertService.error('Erro ao atualizar tag');
              console.error(err);
            },
          });
        }
      },
    });
  }

  onDeleteTag(tag: Tag) {
    this.modalService.showConfirm({
      title: 'Excluir Tag',
      message: `Tem certeza que deseja excluir a tag "${tag.nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    }).subscribe({
      next: (confirmed) => {
        if (confirmed) {
          this.tagService.delete(tag.id!).subscribe({
            next: () => {
              this.alertService.success('Tag excluída com sucesso');
              this.loadAllTags();
            },
            error: (err) => {
              this.alertService.error('Erro ao excluir tag');
              console.error(err);
            },
          });
        }
      },
    });
  }

  // ===== Aba Pesquisas =====
  openNewSearch() {
    this.newTokens.set([]);
    this.showTagSelect.set(false);
    this.showOperadorButtons.set(false);
    this.tagSelectValue.set('');
    this.formSupervisorIds.set([]);
    this.formDataInicio.set('');
    this.formDataFim.set('');
    this.formNomePesquisa.set('');
    this.showNewSearch.set(true);
  }

  closeNewSearch() {
    this.showNewSearch.set(false);
  }

  toggleTagSelect() {
    this.showTagSelect.update((v) => !v);
    this.showOperadorButtons.set(false);
  }

  toggleOperadorButtons() {
    this.showOperadorButtons.update((v) => !v);
    this.showTagSelect.set(false);
  }

  addTagToken(nome: string) {
    if (!nome || !this.canAddTag()) return;
    this.newTokens.update((t) => [...t, nome]);
    this.showTagSelect.set(false);
    this.tagSelectValue.set('');
  }

  addOperadorToken(op: string) {
    if (!this.canAddOperador()) return;
    this.newTokens.update((t) => [...t, op]);
    this.showOperadorButtons.set(false);
  }

  removeNewToken(index: number) {
    this.newTokens.update((t) => t.filter((_, i) => i !== index));
  }

  salvarPesquisa() {
    if (!this.canSave()) {
      this.alertService.warning('Defina uma busca por tags válida ou ao menos um filtro adicional');
      return;
    }

    const tokens = this.newTokens();
    let nome = this.formNomePesquisa().trim();
    if (!nome) {
      const partes: string[] = [];
      if (tokens.length > 0) partes.push(tokens.join(' '));
      if (this.formSupervisorIds().length > 0) {
        const nomes = this.formSupervisorIds()
          .map((id) => this.colaboradores().find((c) => c.id === id)?.nome ?? `#${id}`);
        partes.push(`Supervisor: ${nomes.join(' ou ')}`);
      }
      if (this.formDataInicio()) partes.push(`Admitido após: ${this.formDataInicio()}`);
      if (this.formDataFim()) partes.push(`Admitido até: ${this.formDataFim()}`);
      nome = partes.join(' | ') || 'Pesquisa personalizada';
    }

    this.grupoService.create({
      nome,
      tokens,
      supervisorIds: this.formSupervisorIds().length > 0 ? this.formSupervisorIds() : undefined,
      dataAdmissaoInicio: this.formDataInicio() || undefined,
      dataAdmissaoFim: this.formDataFim() || undefined,
    }).subscribe({
      next: () => {
        this.alertService.success('Pesquisa salva com sucesso');
        this.closeNewSearch();
        this.loadPesquisas();
      },
      error: (err) => {
        this.alertService.error('Erro ao salvar pesquisa');
        console.error(err);
      },
    });
  }

  openSavedSearch(grupo: Grupo) {
    this.selectedPesquisa.set(grupo);
    this.searchResults.set(null);
    this.searching.set(false);
    this.showSavedSearch.set(true);
  }

  closeSavedSearch() {
    this.showSavedSearch.set(false);
    this.selectedPesquisa.set(null);
    this.searchResults.set(null);
  }

  buscarColaboradores() {
    const grupo = this.selectedPesquisa();
    if (!grupo) return;

    this.searching.set(true);
    this.colaboradorService.searchAdvanced({
      tokens: grupo.tokens,
      supervisorIds: grupo.supervisorIds,
      dataAdmissaoInicio: grupo.dataAdmissaoInicio,
      dataAdmissaoFim: grupo.dataAdmissaoFim,
    }).subscribe({
      next: (resultados) => {
        this.searchResults.set(resultados);
        this.searching.set(false);
      },
      error: (err) => {
        this.alertService.error('Erro ao executar a busca');
        console.error(err);
        this.searching.set(false);
      },
    });
  }

  gerarRelatorio() {
    const grupo = this.selectedPesquisa();
    if (!grupo?.id) return;

    this.relatorioService.gerar(grupo.id).subscribe({
      next: () => {
        this.alertService.success('Relatório gerado com sucesso');
        this.loadRelatorios();
      },
      error: (err) => {
        this.alertService.error('Erro ao gerar relatório');
        console.error(err);
      },
    });
  }

  deletarPesquisa() {
    const grupo = this.selectedPesquisa();
    if (!grupo?.id) return;

    this.grupoService.delete(grupo.id).subscribe({
      next: () => {
        this.alertService.success('Pesquisa excluída com sucesso');
        this.loadPesquisas();
        this.closeSavedSearch();
      },
      error: (err) => {
        this.alertService.error('Erro ao excluir pesquisa');
        console.error(err);
      },
    });
  }

  onDeletePesquisa(grupo: Grupo) {
    this.modalService.showConfirm({
      title: 'Excluir Pesquisa',
      message: `Tem certeza que deseja excluir a pesquisa "${grupo.nome}"? Os relatórios já gerados a partir dela serão mantidos.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    }).subscribe({
      next: (confirmed) => {
        if (confirmed) {
          this.grupoService.delete(grupo.id!).subscribe({
            next: () => {
              this.alertService.success('Pesquisa excluída com sucesso');
              this.loadPesquisas();
            },
            error: (err) => {
              this.alertService.error('Erro ao excluir pesquisa');
              console.error(err);
            },
          });
        }
      },
    });
  }
}
