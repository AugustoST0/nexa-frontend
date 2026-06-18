import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Save } from 'lucide-angular';
import { TagService } from '../../../core/services/crud/tag-service';
import { GrupoService } from '../../../core/services/crud/grupo-service';
import { AlertService } from '../../../core/services/alert-service';
import { ModalService } from '../../../core/services/modal-service';
import { Tag } from '../../../core/model/Tag.model';
import { Grupo } from '../../../core/model/Grupo.model';

const OPERADORES = ['E', 'OU', 'NÃO POSSUI'];

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './advanced-search.html',
  styleUrls: ['./advanced-search.css'],
})
export class AdvancedSearchComponent implements OnInit {
  @Input() tokens: string[] = [];
  @Output() tokensChange = new EventEmitter<string[]>();
  @Output() search = new EventEmitter<string[]>();
  @Output() clear = new EventEmitter<void>();

  private readonly tagService = inject(TagService);
  private readonly grupoService = inject(GrupoService);
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
    return tokens.length >= 1 && !this.isOperador(tokens[tokens.length - 1]);
  });

  canSave = computed(() => {
    const tokens = this.tokensAvancados();
    return tokens.length >= 3 && !this.isOperador(tokens[tokens.length - 1]);
  });

  ngOnInit(): void {
    this.tokensAvancados.set(this.tokens ?? []);
    this.loadTags();
    this.loadPesquisasSalvas();
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
    const tokens = this.tokensAvancados();
    this.grupoService.create({ nome: tokens.join(' '), tokens }).subscribe({
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
    this.search.emit(this.tokensAvancados());
  }

  onClear(): void {
    this.tokensAvancados.set([]);
    this.showTagSelect.set(false);
    this.showOperadorButtons.set(false);
    this.tagSelectValue.set('');
    this.tokensChange.emit([]);
    this.clear.emit();
  }
}
