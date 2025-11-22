import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GrupoService } from '../../../core/services/grupo-service';
import { TagService } from '../../../core/services/tag-service';
import { ToastrService } from 'ngx-toastr';
import { Grupo } from '../../../core/model/Grupo';
import { Tag } from '../../../core/model/Tag';

@Component({
  selector: 'app-catalogo',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalogo implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly grupoService = inject(GrupoService);
  private readonly tagService = inject(TagService);
  private readonly toastr = inject(ToastrService);

  grupos = signal<Grupo[]>([]);
  tags = signal<Tag[]>([]);
  selectedGrupo = signal<Grupo | null>(null);
  loading = signal(false);
  
  showGrupoForm = signal(false);
  showTagForm = signal(false);
  editingGrupo = signal<Grupo | null>(null);
  editingTag = signal<Tag | null>(null);

  grupoForm!: FormGroup;
  tagForm!: FormGroup;

  ngOnInit() {
    this.initializeForms();
    this.loadGrupos();
  }

  initializeForms() {
    this.grupoForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      descricao: ['', Validators.maxLength(500)],
    });

    this.tagForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      descricao: ['', Validators.maxLength(500)],
      grupoId: [null, Validators.required],
    });
  }

  loadGrupos() {
    this.loading.set(true);
    this.grupoService.getAll().subscribe({
      next: (grupos) => {
        this.grupos.set(grupos);
        this.loading.set(false);
      },
      error: (err) => {
        this.toastr.error('Erro ao carregar grupos', 'Erro');
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
        this.toastr.error('Erro ao carregar tags', 'Erro');
        console.error(err);
      },
    });
  }

  selectGrupo(grupo: Grupo) {
    this.selectedGrupo.set(grupo);
    this.loadTagsByGrupo(grupo.id!);
    this.showTagForm.set(false);
    this.editingTag.set(null);
  }

  onNewGrupo() {
    this.showGrupoForm.set(true);
    this.editingGrupo.set(null);
    this.grupoForm.reset();
  }

  onEditGrupo(grupo: Grupo) {
    this.showGrupoForm.set(true);
    this.editingGrupo.set(grupo);
    this.grupoForm.patchValue({
      nome: grupo.nome,
      descricao: grupo.descricao,
    });
  }

  onSubmitGrupo() {
    if (this.grupoForm.invalid) {
      this.toastr.error('Preencha todos os campos obrigatórios', 'Erro');
      this.grupoForm.markAllAsTouched();
      return;
    }

    const grupoData = this.grupoForm.value;

    if (this.editingGrupo()) {
      this.grupoService.update(this.editingGrupo()!.id!, grupoData).subscribe({
        next: () => {
          this.toastr.success('Grupo atualizado com sucesso', 'Sucesso');
          this.loadGrupos();
          this.showGrupoForm.set(false);
          this.editingGrupo.set(null);
        },
        error: (err) => {
          this.toastr.error('Erro ao atualizar grupo', 'Erro');
          console.error(err);
        },
      });
    } else {
      this.grupoService.create(grupoData).subscribe({
        next: () => {
          this.toastr.success('Grupo criado com sucesso', 'Sucesso');
          this.loadGrupos();
          this.showGrupoForm.set(false);
          this.grupoForm.reset();
        },
        error: (err) => {
          this.toastr.error('Erro ao criar grupo', 'Erro');
          console.error(err);
        },
      });
    }
  }

  onDeleteGrupo(grupo: Grupo) {
    if (confirm(`Tem certeza que deseja excluir o grupo "${grupo.nome}"? Todas as tags associadas também serão excluídas.`)) {
      this.grupoService.delete(grupo.id!).subscribe({
        next: () => {
          this.toastr.success('Grupo excluído com sucesso', 'Sucesso');
          this.loadGrupos();
          if (this.selectedGrupo()?.id === grupo.id) {
            this.selectedGrupo.set(null);
            this.tags.set([]);
          }
        },
        error: (err) => {
          this.toastr.error('Erro ao excluir grupo', 'Erro');
          console.error(err);
        },
      });
    }
  }

  onNewTag() {
    if (!this.selectedGrupo()) {
      this.toastr.warning('Selecione um grupo primeiro', 'Aviso');
      return;
    }
    this.showTagForm.set(true);
    this.editingTag.set(null);
    this.tagForm.reset();
    this.tagForm.patchValue({ grupoId: this.selectedGrupo()!.id });
  }

  onEditTag(tag: Tag) {
    this.showTagForm.set(true);
    this.editingTag.set(tag);
    this.tagForm.patchValue({
      nome: tag.nome,
      descricao: tag.descricao,
      grupoId: tag.grupoId,
    });
  }

  onSubmitTag() {
    if (this.tagForm.invalid) {
      this.toastr.error('Preencha todos os campos obrigatórios', 'Erro');
      this.tagForm.markAllAsTouched();
      return;
    }

    const tagData = this.tagForm.value;

    if (this.editingTag()) {
      this.tagService.update(this.editingTag()!.id!, tagData).subscribe({
        next: () => {
          this.toastr.success('Tag atualizada com sucesso', 'Sucesso');
          this.loadTagsByGrupo(this.selectedGrupo()!.id!);
          this.showTagForm.set(false);
          this.editingTag.set(null);
        },
        error: (err) => {
          this.toastr.error('Erro ao atualizar tag', 'Erro');
          console.error(err);
        },
      });
    } else {
      this.tagService.create(tagData).subscribe({
        next: () => {
          this.toastr.success('Tag criada com sucesso', 'Sucesso');
          this.loadTagsByGrupo(this.selectedGrupo()!.id!);
          this.showTagForm.set(false);
          this.tagForm.reset();
          this.tagForm.patchValue({ grupoId: this.selectedGrupo()!.id });
        },
        error: (err) => {
          this.toastr.error('Erro ao criar tag', 'Erro');
          console.error(err);
        },
      });
    }
  }

  onDeleteTag(tag: Tag) {
    if (confirm(`Tem certeza que deseja excluir a tag "${tag.nome}"?`)) {
      this.tagService.delete(tag.id!).subscribe({
        next: () => {
          this.toastr.success('Tag excluída com sucesso', 'Sucesso');
          this.loadTagsByGrupo(this.selectedGrupo()!.id!);
        },
        error: (err) => {
          this.toastr.error('Erro ao excluir tag', 'Erro');
          console.error(err);
        },
      });
    }
  }

  cancelGrupoForm() {
    this.showGrupoForm.set(false);
    this.editingGrupo.set(null);
    this.grupoForm.reset();
  }

  cancelTagForm() {
    this.showTagForm.set(false);
    this.editingTag.set(null);
    this.tagForm.reset();
  }
}
