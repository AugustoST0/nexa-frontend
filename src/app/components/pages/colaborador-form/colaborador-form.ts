import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ColaboradorService } from '../../../core/services/colaborador-service';
import { TagService } from '../../../core/services/tag-service';
import { ToastrService } from 'ngx-toastr';
import { ColaboradorCreateDTO } from '../../../core/dto/ColaboradorCreateDTO';
import { ColaboradorUpdateDTO } from '../../../core/dto/ColaboradorUpdateDTO';
import { Tag } from '../../../core/model/Tag';
import { ColaboradorWithCalcs } from '../../../core/model/ColaboradorWithCalcs';

@Component({
  selector: 'app-colaborador-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './colaborador-form.html',
  styleUrl: './colaborador-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColaboradorForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly colaboradorService = inject(ColaboradorService);
  private readonly tagService = inject(TagService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastr = inject(ToastrService);

  colaboradorForm!: FormGroup;
  isEditMode = signal(false);
  colaboradorId = signal<number | null>(null);
  loading = signal(false);
  availableTags = signal<Tag[]>([]);
  selectedTags = signal<number[]>([]);
  supervisores = signal<ColaboradorWithCalcs[]>([]);

  ngOnInit() {
    this.initializeForm();
    this.loadTags();
    this.loadSupervisores();

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode.set(true);
        this.colaboradorId.set(+id);
        this.loadColaborador(+id);
      }
    });
  }

  initializeForm() {
    this.colaboradorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      cargo: ['', [Validators.required, Validators.maxLength(100)]],
      departamento: ['', [Validators.required, Validators.maxLength(100)]],
      dataNascimento: ['', Validators.required],
      dataAdmissao: ['', Validators.required],
      supervisorId: [null],
      ativo: [true],
    });
  }

  loadTags() {
    this.tagService.getAll().subscribe({
      next: (tags) => {
        this.availableTags.set(tags);
      },
      error: (err) => {
        console.error('Erro ao carregar tags:', err);
      },
    });
  }

  loadSupervisores() {
    this.colaboradorService.getAll().subscribe({
      next: (colaboradores) => {
        this.supervisores.set(colaboradores);
      },
      error: (err) => {
        console.error('Erro ao carregar supervisores:', err);
      },
    });
  }

  loadColaborador(id: number) {
    this.loading.set(true);
    this.colaboradorService.getById(id).subscribe({
      next: (colaborador) => {
        this.colaboradorForm.patchValue({
          nome: colaborador.nome,
          email: colaborador.email,
          cargo: colaborador.cargo,
          departamento: colaborador.departamento,
          dataNascimento: colaborador.dataNascimento,
          dataAdmissao: colaborador.dataAdmissao,
          supervisorId: colaborador.supervisorId,
          ativo: colaborador.ativo,
        });
        
        if (colaborador.tags) {
          this.selectedTags.set(colaborador.tags.map(t => t.id!));
        }
        
        this.loading.set(false);
      },
      error: (err) => {
        this.toastr.error('Erro ao carregar colaborador', 'Erro');
        console.error(err);
        this.loading.set(false);
        this.router.navigate(['/colaboradores']);
      },
    });
  }

  toggleTag(tagId: number) {
    const current = this.selectedTags();
    if (current.includes(tagId)) {
      this.selectedTags.set(current.filter(id => id !== tagId));
    } else {
      this.selectedTags.set([...current, tagId]);
    }
  }

  isTagSelected(tagId: number): boolean {
    return this.selectedTags().includes(tagId);
  }

  onSubmit() {
    if (this.colaboradorForm.invalid) {
      this.toastr.error('Preencha todos os campos obrigatórios', 'Erro');
      this.colaboradorForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    if (this.isEditMode()) {
      const updateData: ColaboradorUpdateDTO = {
        ...this.colaboradorForm.value,
        tagIds: this.selectedTags(),
      };
      
      this.colaboradorService.update(this.colaboradorId()!, updateData).subscribe({
        next: () => {
          this.toastr.success('Colaborador atualizado com sucesso', 'Sucesso');
          this.router.navigate(['/colaboradores']);
        },
        error: (err) => {
          this.toastr.error('Erro ao atualizar colaborador', 'Erro');
          console.error(err);
          this.loading.set(false);
        },
      });
    } else {
      const createData: ColaboradorCreateDTO = {
        ...this.colaboradorForm.value,
        tagIds: this.selectedTags(),
      };
      
      this.colaboradorService.create(createData).subscribe({
        next: () => {
          this.toastr.success('Colaborador criado com sucesso', 'Sucesso');
          this.router.navigate(['/colaboradores']);
        },
        error: (err) => {
          this.toastr.error('Erro ao criar colaborador', 'Erro');
          console.error(err);
          this.loading.set(false);
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(['/colaboradores']);
  }
}
