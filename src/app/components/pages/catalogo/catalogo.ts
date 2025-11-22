import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Edit, Trash2, Plus } from 'lucide-angular';
import { GrupoService } from '../../../core/services/crud/grupo-service';
import { TagService } from '../../../core/services/crud/tag-service';
import { AlertService } from '../../../core/services/alert-service';
import { ModalService } from '../../../core/services/modal-service';
import { Grupo } from '../../../core/model/Grupo.model';
import { Tag } from '../../../core/model/Tag.model';
import { FormModalConfig } from '../../../core/model/FormModalConfig.model';
import { ButtonComponent } from '../../ui/button/button';
import { CardComponent } from '../../ui/card/card';
import { BadgeComponent } from '../../ui/badge/badge';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, LucideAngularModule, ButtonComponent, CardComponent, BadgeComponent],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalogo implements OnInit {
  private readonly grupoService = inject(GrupoService);
  private readonly tagService = inject(TagService);
  private readonly alertService = inject(AlertService);
  private readonly modalService = inject(ModalService);

  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Plus = Plus;

  grupos = signal<Grupo[]>([]);
  tags = signal<Tag[]>([]);
  selectedGrupo = signal<Grupo | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.loadGrupos();
  }

  loadGrupos() {
    this.loading.set(true);
    this.grupoService.getAll().subscribe({
      next: (grupos) => {
        this.grupos.set(grupos);
        this.loading.set(false);
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar grupos');
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  loadTagsByGrupo(grupoId: number) {
    this.tagService.getByGrupoId(grupoId).subscribe({
      next: (tags) => {
        this.tags.set(tags);
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar tags');
        console.error(err);
      },
    });
  }

  selectGrupo(grupo: Grupo) {
    this.selectedGrupo.set(grupo);
    this.loadTagsByGrupo(grupo.id!);
  }

  onNewGrupo() {
    const config: FormModalConfig = {
      title: 'Novo Grupo',
      fields: [
        {
          name: 'name',
          label: 'Nome',
          type: 'text',
          placeholder: 'Ex: Skills, Certificações, etc.',
          required: true,
          maxLength: 100,
        },
        {
          name: 'description',
          label: 'Descrição',
          type: 'textarea',
          placeholder: 'Descrição opcional do grupo',
          rows: 3,
          maxLength: 500,
        },
      ],
      submitText: 'Criar',
      cancelText: 'Cancelar',
    };

    this.modalService.showForm(config).subscribe({
      next: (data) => {
        if (data) {
          this.grupoService.create(data).subscribe({
            next: () => {
              this.alertService.success('Grupo criado com sucesso');
              this.loadGrupos();
            },
            error: (err) => {
              this.alertService.error('Erro ao criar grupo');
              console.error(err);
            },
          });
        }
      },
    });
  }

  onEditGrupo(grupo: Grupo) {
    const config: FormModalConfig = {
      title: 'Editar Grupo',
      fields: [
        {
          name: 'name',
          label: 'Nome',
          type: 'text',
          value: grupo.name,
          placeholder: 'Ex: Skills, Certificações, etc.',
          required: true,
          maxLength: 100,
        },
        {
          name: 'description',
          label: 'Descrição',
          type: 'textarea',
          value: grupo.description || '',
          placeholder: 'Descrição opcional do grupo',
          rows: 3,
          maxLength: 500,
        },
      ],
      submitText: 'Atualizar',
      cancelText: 'Cancelar',
    };

    this.modalService.showForm(config).subscribe({
      next: (data) => {
        if (data) {
          this.grupoService.update(grupo.id!, data).subscribe({
            next: () => {
              this.alertService.success('Grupo atualizado com sucesso');
              this.loadGrupos();
            },
            error: (err) => {
              this.alertService.error('Erro ao atualizar grupo');
              console.error(err);
            },
          });
        }
      },
    });
  }

  onDeleteGrupo(grupo: Grupo) {
    if (confirm(`Tem certeza que deseja excluir o grupo "${grupo.name}"? Todas as tags associadas também serão excluídas.`)) {
      this.grupoService.delete(grupo.id!).subscribe({
        next: () => {
          this.alertService.success('Grupo excluído com sucesso');
          this.loadGrupos();
          if (this.selectedGrupo()?.id === grupo.id) {
            this.selectedGrupo.set(null);
            this.tags.set([]);
          }
        },
        error: (err) => {
          this.alertService.error('Erro ao excluir grupo');
          console.error(err);
        },
      });
    }
  }

  onNewTag() {
    if (!this.selectedGrupo()) {
      this.alertService.warning('Selecione um grupo primeiro');
      return;
    }

    const config: FormModalConfig = {
      title: 'Nova Tag',
      fields: [
        {
          name: 'name',
          label: 'Nome',
          type: 'text',
          placeholder: 'Ex: Python, Java, Liderança, etc.',
          required: true,
          maxLength: 100,
        },
        {
          name: 'description',
          label: 'Descrição',
          type: 'textarea',
          placeholder: 'Descrição opcional da tag',
          rows: 3,
          maxLength: 500,
        },
      ],
      submitText: 'Criar',
      cancelText: 'Cancelar',
    };

    this.modalService.showForm(config).subscribe({
      next: (data) => {
        if (data) {
          const tagData = {
            ...data,
            groupId: this.selectedGrupo()!.id,
          };

          this.tagService.create(tagData).subscribe({
            next: () => {
              this.alertService.success('Tag criada com sucesso');
              this.loadTagsByGrupo(this.selectedGrupo()!.id!);
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
        {
          name: 'name',
          label: 'Nome',
          type: 'text',
          value: tag.name,
          placeholder: 'Ex: Python, Java, Liderança, etc.',
          required: true,
          maxLength: 100,
        },
        {
          name: 'description',
          label: 'Descrição',
          type: 'textarea',
          value: tag.description || '',
          placeholder: 'Descrição opcional da tag',
          rows: 3,
          maxLength: 500,
        },
      ],
      submitText: 'Atualizar',
      cancelText: 'Cancelar',
    };

    this.modalService.showForm(config).subscribe({
      next: (data) => {
        if (data) {
          const tagData = {
            ...data,
            groupId: tag.groupId,
          };

          this.tagService.update(tag.id!, tagData).subscribe({
            next: () => {
              this.alertService.success('Tag atualizada com sucesso');
              this.loadTagsByGrupo(this.selectedGrupo()!.id!);
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
    if (confirm(`Tem certeza que deseja excluir a tag "${tag.name}"?`)) {
      this.tagService.delete(tag.id!).subscribe({
        next: () => {
          this.alertService.success('Tag excluída com sucesso');
          this.loadTagsByGrupo(this.selectedGrupo()!.id!);
        },
        error: (err) => {
          this.alertService.error('Erro ao excluir tag');
          console.error(err);
        },
      });
    }
  }
}
