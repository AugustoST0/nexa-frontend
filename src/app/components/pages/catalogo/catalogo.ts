import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { LucideAngularModule, Edit, Trash2, Plus, Link, Unlink } from 'lucide-angular';
import { GrupoService } from '../../../core/services/crud/grupo-service';
import { TagService } from '../../../core/services/crud/tag-service';
import { AlertService } from '../../../core/services/alert-service';
import { ModalService } from '../../../core/services/modal-service';
import { Grupo } from '../../../core/model/Grupo.model';
import { Tag } from '../../../core/model/Tag.model';
import { FormModalConfig } from '../../../core/model/FormModalConfig.model';
import { ListModalConfig } from '../../../core/model/ListModalConfig.model';
import { FilterConfig } from '../../../core/model/FilterConfig.model';
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
  readonly Link = Link;
  readonly Unlink = Unlink;

  grupos = signal<Grupo[]>([]);
  tags = signal<Tag[]>([]);
  selectedGrupo = signal<Grupo | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.loadGrupos();
    this.loadAllTags();
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

  loadAllTags() {
    this.tagService.getAll().subscribe({
      next: (tags) => {
        this.tags.set(tags);
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar tags');
        console.error(err);
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
    if (this.selectedGrupo()?.id === grupo.id) {
      this.selectedGrupo.set(null);
      this.loadAllTags();
    } else {
      this.selectedGrupo.set(grupo);
      this.loadTagsByGrupo(grupo.id!);
    }
  }

  onNewGrupo() {
    // Carregar todas as tags para o modal
    this.tagService.getAll().subscribe({
      next: (allTags) => {
        const tagOptions = allTags.map(tag => ({
          label: tag.nome,
          value: tag.id,
        }));

        const config: FormModalConfig = {
          title: 'Novo Grupo',
          fields: [
            {
              name: 'nome',
              label: 'Nome',
              type: 'text',
              placeholder: 'Ex: Skills, Certificações, etc.',
              required: true,
              maxLength: 100,
            },
            {
              name: 'descricao',
              label: 'Descrição',
              type: 'textarea',
              placeholder: 'Descrição opcional do grupo',
              rows: 3,
              maxLength: 500,
            },
            {
              name: 'tagIds',
              label: 'Tags',
              type: 'tag-selector',
              placeholder: 'Buscar tags...',
              options: tagOptions,
            },
          ],
          submitText: 'Criar',
          cancelText: 'Cancelar',
        };

        this.modalService.showForm(config).subscribe({
          next: (data) => {
            if (data) {
              const tagIds = data.tagIds || [];
              const grupoData = {
                nome: data.nome,
                descricao: data.descricao,
              };

              this.grupoService.create(grupoData).subscribe({
                next: (novoGrupo) => {
                  // Associar as tags selecionadas ao grupo em paralelo
                  if (tagIds.length > 0) {
                    const linkOperations = tagIds.map((tagId: number) =>
                      this.tagService.linkToGrupo(tagId, novoGrupo.id!)
                    );

                    forkJoin(linkOperations).subscribe({
                      next: () => {
                        this.alertService.success('Grupo criado com sucesso');
                        this.loadGrupos();
                        this.selectGrupo(novoGrupo);
                      },
                      error: (err) => {
                        this.alertService.error('Erro ao associar tags ao grupo');
                        console.error(err);
                        this.loadGrupos();
                        this.selectGrupo(novoGrupo);
                      },
                    });
                  } else {
                    this.alertService.success('Grupo criado com sucesso');
                    this.loadGrupos();
                    this.selectGrupo(novoGrupo);
                  }
                },
                error: (err) => {
                  this.alertService.error('Erro ao criar grupo');
                  console.error(err);
                },
              });
            }
          },
        });
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar tags');
        console.error(err);
      },
    });
  }

  onEditGrupo(grupo: Grupo) {
    // Carregar todas as tags para o modal
    this.tagService.getAll().subscribe({
      next: (allTags) => {
        const tagOptions = allTags.map(tag => ({
          label: tag.nome,
          value: tag.id,
        }));

        const config: FormModalConfig = {
          title: 'Editar Grupo',
          fields: [
            {
              name: 'nome',
              label: 'Nome',
              type: 'text',
              value: grupo.nome,
              placeholder: 'Ex: Skills, Certificações, etc.',
              required: true,
              maxLength: 100,
            },
            {
              name: 'descricao',
              label: 'Descrição',
              type: 'textarea',
              value: grupo.descricao || '',
              placeholder: 'Descrição opcional do grupo',
              rows: 3,
              maxLength: 500,
            },
            {
              name: 'tagIds',
              label: 'Tags',
              type: 'tag-selector',
              value: grupo.tagIds || [],
              placeholder: 'Buscar tags...',
              options: tagOptions,
            },
          ],
          submitText: 'Atualizar',
          cancelText: 'Cancelar',
        };

        this.modalService.showForm(config).subscribe({
          next: (data) => {
            if (data) {
              const tagIds = data.tagIds || [];
              const grupoData = {
                nome: data.nome,
                descricao: data.descricao,
              };

              this.grupoService.update(grupo.id!, grupoData).subscribe({
                next: () => {
                  // Remover todas as tags antigas e adicionar as novas
                  const currentTagIds = grupo.tagIds || [];
                  
                  // Preparar operações de desassociação
                  const unlinkOperations = currentTagIds
                    .filter((tagId: number) => !tagIds.includes(tagId))
                    .map((tagId: number) => this.tagService.unlinkFromGrupo(tagId, grupo.id!));

                  // Preparar operações de associação
                  const linkOperations = tagIds
                    .filter((tagId: number) => !currentTagIds.includes(tagId))
                    .map((tagId: number) => this.tagService.linkToGrupo(tagId, grupo.id!));

                  // Combinar todas as operações
                  const allOperations = [...unlinkOperations, ...linkOperations];

                  if (allOperations.length > 0) {
                    // Executar todas as operações em paralelo
                    forkJoin(allOperations).subscribe({
                      next: () => {
                        this.alertService.success('Grupo atualizado com sucesso');
                        this.loadGrupos();
                      },
                      error: (err) => {
                        this.alertService.error('Erro ao atualizar tags');
                        console.error(err);
                        this.loadGrupos();
                      },
                    });
                  } else {
                    this.alertService.success('Grupo atualizado com sucesso');
                    this.loadGrupos();
                  }
                },
                error: (err) => {
                  this.alertService.error('Erro ao atualizar grupo');
                  console.error(err);
                },
              });
            }
          },
        });
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar tags');
        console.error(err);
      },
    });
  }

  onDeleteGrupo(grupo: Grupo) {
    this.modalService.showConfirm({
      title: 'Excluir Grupo',
      message: `Tem certeza que deseja excluir o grupo "${grupo.nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    }).subscribe({
      next: (confirmed) => {
        if (confirmed) {
          this.grupoService.delete(grupo.id!).subscribe({
            next: () => {
              this.alertService.success('Grupo excluído com sucesso');
              this.loadGrupos();
              if (this.selectedGrupo()?.id === grupo.id) {
                this.selectedGrupo.set(null);
                this.loadAllTags();
              }
            },
            error: (err) => {
              this.alertService.error('Erro ao excluir grupo');
              console.error(err);
            },
          });
        }
      },
    });
  }

  onNewTag() {
    const config: FormModalConfig = {
      title: 'Nova Tag',
      fields: [
        {
          name: 'nome',
          label: 'Nome',
          type: 'text',
          placeholder: 'Ex: Mãe, Pet, Liderança, etc.',
          required: true,
          maxLength: 100,
        },
        {
          name: 'descricao',
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
            grupoId: this.selectedGrupo()?.id,
          };

          this.tagService.create(tagData).subscribe({
            next: () => {
              this.alertService.success('Tag criada com sucesso');
              if (this.selectedGrupo()) {
                this.loadTagsByGrupo(this.selectedGrupo()!.id!);
              } else {
                this.loadAllTags();
              }
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
          name: 'nome',
          label: 'Nome',
          type: 'text',
          value: tag.nome,
          placeholder: 'Ex: Python, Java, Liderança, etc.',
          required: true,
          maxLength: 100,
        },
        {
          name: 'descricao',
          label: 'Descrição',
          type: 'textarea',
          value: tag.descricao || '',
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
          this.tagService.update(tag.id!, data).subscribe({
            next: () => {
              this.alertService.success('Tag atualizada com sucesso');
              if (this.selectedGrupo()) {
                this.loadTagsByGrupo(this.selectedGrupo()!.id!);
              } else {
                this.loadAllTags();
              }
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

  onUnlinkTag(tag: Tag) {
    this.modalService.showConfirm({
      title: 'Desassociar Tag',
      message: `Tem certeza que deseja desassociar a tag "${tag.nome}" deste grupo?`,
      confirmText: 'Desassociar',
      cancelText: 'Cancelar',
    }).subscribe({
      next: (confirmed) => {
        if (confirmed) {
          const grupoId = this.selectedGrupo()!.id!;

          this.tagService.unlinkFromGrupo(tag.id!, grupoId).subscribe({
            next: () => {
              this.alertService.success('Tag desassociada com sucesso');
              this.loadTagsByGrupo(grupoId);
            },
            error: (err) => {
              this.alertService.error('Erro ao desassociar tag');
              console.error(err);
            },
          });
        }
      },
    });
  }

  onAssociateExistingTag() {
    if (!this.selectedGrupo()) {
      this.alertService.warning('Selecione um grupo primeiro');
      return;
    }

    const grupoId = this.selectedGrupo()!.id!;
    const grupoNome = this.selectedGrupo()!.nome;

    // Obter todas as tags primeiro
    this.tagService.getAll().subscribe({
      next: (allTags) => {
        // Obter tags já associadas ao grupo
        this.tagService.getByGrupoId(grupoId).subscribe({
          next: (associatedTags) => {
            const associatedTagIds = associatedTags.map(t => t.id!);

            const tagOptions = allTags.map(tag => ({
              label: tag.nome,
              value: tag.id,
            }));

            const config: FormModalConfig = {
              title: `Associar Tags ao Grupo "${grupoNome}"`,
              fields: [
                {
                  name: 'tagIds',
                  label: 'Tags',
                  type: 'tag-selector',
                  value: associatedTagIds,
                  placeholder: 'Buscar tags...',
                  options: tagOptions,
                },
              ],
              submitText: 'Salvar',
              cancelText: 'Cancelar',
            };

            this.modalService.showForm(config).subscribe({
              next: (data) => {
                if (data) {
                  const newTagIds = data.tagIds || [];
                  
                  // Preparar operações de desassociação
                  const unlinkOperations = associatedTagIds
                    .filter((tagId: number) => !newTagIds.includes(tagId))
                    .map((tagId: number) => this.tagService.unlinkFromGrupo(tagId, grupoId));

                  // Preparar operações de associação
                  const linkOperations = newTagIds
                    .filter((tagId: number) => !associatedTagIds.includes(tagId))
                    .map((tagId: number) => this.tagService.linkToGrupo(tagId, grupoId));

                  // Combinar todas as operações
                  const allOperations = [...unlinkOperations, ...linkOperations];

                  if (allOperations.length > 0) {
                    // Executar todas as operações em paralelo
                    forkJoin(allOperations).subscribe({
                      next: () => {
                        this.alertService.success('Tags associadas com sucesso');
                        this.loadTagsByGrupo(grupoId);
                      },
                      error: (err) => {
                        this.alertService.error('Erro ao atualizar tags');
                        console.error(err);
                      },
                    });
                  } else {
                    this.alertService.success('Tags associadas com sucesso');
                    this.loadTagsByGrupo(grupoId);
                  }
                }
              },
            });
          },
          error: (err) => {
            this.alertService.error('Erro ao carregar tags do grupo');
            console.error(err);
          },
        });
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar tags');
        console.error(err);
      },
    });
  }

}
