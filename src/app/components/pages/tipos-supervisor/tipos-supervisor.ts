import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Edit, Trash2, X } from 'lucide-angular';
import { TipoSupervisorService } from '../../../core/services/crud/tipo-supervisor-service';
import { AlertService } from '../../../core/services/alert-service';
import { ModalService } from '../../../core/services/modal-service';
import { TipoSupervisor } from '../../../core/model/Supervisao.model';
import { ButtonComponent } from '../../ui/button/button';
import { CardComponent } from '../../ui/card/card';

@Component({
  selector: 'app-tipos-supervisor',
  imports: [CommonModule, FormsModule, LucideAngularModule, ButtonComponent, CardComponent],
  templateUrl: './tipos-supervisor.html',
  styleUrl: './tipos-supervisor.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TiposSupervisor implements OnInit {
  private readonly tipoService = inject(TipoSupervisorService);
  private readonly alertService = inject(AlertService);
  private readonly modalService = inject(ModalService);

  readonly Plus = Plus;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly X = X;

  tipos = signal<TipoSupervisor[]>([]);
  loading = signal(false);

  // Modal criar/editar
  showModal = signal(false);
  editingId = signal<number | null>(null);
  formNome = signal('');
  formNivel = signal<number | null>(null);
  formDescricao = signal('');

  tiposOrdenados = computed(() =>
    [...this.tipos()].sort((a, b) => (a.nivel ?? 0) - (b.nivel ?? 0))
  );

  canSave = computed(() => {
    const nivel = this.formNivel();
    return !!this.formNome().trim() && nivel != null && nivel >= 1;
  });

  ngOnInit() {
    this.loadTipos();
  }

  loadTipos() {
    this.loading.set(true);
    this.tipoService.getAll().subscribe({
      next: (tipos) => {
        this.tipos.set(tipos);
        this.loading.set(false);
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar tipos de supervisão');
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  openNew() {
    this.editingId.set(null);
    this.formNome.set('');
    this.formNivel.set(null);
    this.formDescricao.set('');
    this.showModal.set(true);
  }

  openEdit(tipo: TipoSupervisor) {
    this.editingId.set(tipo.id);
    this.formNome.set(tipo.nome);
    this.formNivel.set(tipo.nivel ?? null);
    this.formDescricao.set(tipo.descricao ?? '');
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  salvar() {
    if (!this.canSave()) return;

    const payload: Partial<TipoSupervisor> = {
      nome: this.formNome().trim(),
      nivel: this.formNivel()!,
      descricao: this.formDescricao().trim() || undefined,
    };

    const id = this.editingId();
    const request$ = id
      ? this.tipoService.update(id, payload)
      : this.tipoService.create(payload);

    request$.subscribe({
      next: () => {
        this.alertService.success(id ? 'Tipo atualizado com sucesso' : 'Tipo criado com sucesso');
        this.closeModal();
        this.loadTipos();
      },
      error: (err) => {
        this.alertService.error(id ? 'Erro ao atualizar tipo' : 'Erro ao criar tipo');
        console.error(err);
      },
    });
  }

  confirmarExclusao(tipo: TipoSupervisor) {
    this.modalService.showConfirm({
      title: 'Excluir Tipo de Supervisão',
      message: `Tem certeza que deseja excluir o tipo "${tipo.nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    }).subscribe((confirmed) => {
      if (confirmed) {
        this.tipoService.delete(tipo.id).subscribe({
          next: () => {
            this.alertService.success('Tipo excluído com sucesso');
            this.loadTipos();
          },
          error: (err) => {
            this.alertService.error('Erro ao excluir tipo');
            console.error(err);
          },
        });
      }
    });
  }
}
