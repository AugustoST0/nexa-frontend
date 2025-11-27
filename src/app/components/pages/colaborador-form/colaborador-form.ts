import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ColaboradorService } from '../../../core/services/crud/colaborador-service';
import { TagService } from '../../../core/services/crud/tag-service';
import { AlertService } from '../../../core/services/alert-service';
import { ColaboradorCreateDTO } from '../../../core/dto/ColaboradorCreateDTO';
import { ColaboradorUpdateDTO } from '../../../core/dto/ColaboradorUpdateDTO';
import { Tag } from '../../../core/model/Tag.model';
import { ColaboradorWithCalcs } from '../../../core/model/ColaboradorWithCalcs.model';
import { ButtonComponent } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { FormFieldComponent } from '../../ui/form-field/form-field';
import { CardComponent } from '../../ui/card/card';
import { BadgeComponent } from '../../ui/badge/badge';

@Component({
  selector: 'app-colaborador-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent, FormFieldComponent, CardComponent, BadgeComponent],
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
  private readonly alertService = inject(AlertService);

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
      matricula: ['', [Validators.required, Validators.maxLength(50)]],
      cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/)]],
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
          matricula: colaborador.matricula,
          cpf: colaborador.cpf,
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
        this.alertService.error('Erro ao carregar colaborador');
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
      this.alertService.error('Preencha todos os campos obrigatórios');
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
          this.alertService.success('Colaborador atualizado com sucesso');
          this.router.navigate(['/colaboradores']);
        },
        error: (err) => {
          this.alertService.error('Erro ao atualizar colaborador');
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
          this.alertService.success('Colaborador criado com sucesso');
          this.router.navigate(['/colaboradores']);
        },
        error: (err) => {
          this.alertService.error('Erro ao criar colaborador');
          console.error(err);
          this.loading.set(false);
        },
      });
    }
  }

  onCancel() {
    this.router.navigate(['/colaboradores']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.colaboradorForm.get(controlName);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Campo obrigatório';
    if (control.errors['email']) return 'Email inválido';
    if (control.errors['pattern'] && controlName === 'cpf') return 'CPF inválido (formato: 000.000.000-00)';
    if (control.errors['maxlength']) {
      return `Máximo de ${control.errors['maxlength'].requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  hasError(fieldName: string): boolean {
    const field = this.colaboradorForm.get(fieldName);
    return !!(field?.invalid && field?.touched);
  }
}
