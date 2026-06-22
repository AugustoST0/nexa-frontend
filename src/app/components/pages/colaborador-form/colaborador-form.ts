import { Component, inject, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'app-colaborador-form',
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonComponent, InputComponent, FormFieldComponent, CardComponent],
  templateUrl: './colaborador-form.html',
  styleUrls: ['./colaborador-form.css'],
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
  showTagsDropdown = signal(false);
  tagSearchInput = signal('');

  ngOnInit() {
    this.initializeForm();
    this.loadTags();

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
      ativo: [true],
    });
  }

  formatCPF(value: string): string {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limited = numbers.slice(0, 11);
    
    // Formata: XXX.XXX.XXX-XX
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 6) {
      return `${limited.slice(0, 3)}.${limited.slice(3)}`;
    } else if (limited.length <= 9) {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6)}`;
    } else {
      return `${limited.slice(0, 3)}.${limited.slice(3, 6)}.${limited.slice(6, 9)}-${limited.slice(9)}`;
    }
  }

  onCPFInput(event: any): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatCPF(input.value);
    this.colaboradorForm.patchValue({ cpf: formatted }, { emitEvent: false });
    input.value = formatted;
  }

  toggleTagsDropdown(): void {
    this.showTagsDropdown.set(!this.showTagsDropdown());
  }

  closeTagsDropdown(): void {
    this.showTagsDropdown.set(false);
  }

  getFilteredTags(): Tag[] {
    const search = this.tagSearchInput().toLowerCase();
    return this.availableTags().filter(tag =>
      tag.nome.toLowerCase().includes(search)
    );
  }

  onTagSearchChange(value: string): void {
    this.tagSearchInput.set(value);
  }

  removeTag(tagId: number): void {
    const current = this.selectedTags();
    this.selectedTags.set(current.filter(id => id !== tagId));
  }

  confirmTagSelection(): void {
    this.closeTagsDropdown();
    this.tagSearchInput.set('');
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
