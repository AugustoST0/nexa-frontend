import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ColaboradorService } from '../../../core/services/crud/colaborador-service';
import { ColaboradorWithCalcs } from '../../../core/model/ColaboradorWithCalcs.model';
import { AlertService } from '../../../core/services/alert-service';
import { ButtonComponent } from '../../ui/button/button';
import { CardComponent } from '../../ui/card/card';
import { BadgeComponent } from '../../ui/badge/badge';

@Component({
  selector: 'app-colaborador-list',
  imports: [CommonModule, RouterModule, ButtonComponent, CardComponent, BadgeComponent],
  templateUrl: './colaborador-list.html',
  styleUrl: './colaborador-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColaboradorList implements OnInit {
  private readonly colaboradorService = inject(ColaboradorService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);

  colaboradores = signal<ColaboradorWithCalcs[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadColaboradores();
  }

  loadColaboradores() {
    this.loading.set(true);
    this.colaboradorService.getAll().subscribe({
      next: (data) => {
        this.colaboradores.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar colaboradores');
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  onEdit(id: number) {
    this.router.navigate(['/colaboradores/editar', id]);
  }

  onDelete(id: number, nome: string) {
    if (confirm(`Tem certeza que deseja excluir o colaborador ${nome}?`)) {
      this.colaboradorService.delete(id).subscribe({
        next: () => {
          this.alertService.success('Colaborador excluído com sucesso');
          this.loadColaboradores();
        },
        error: (err) => {
          this.alertService.error('Erro ao excluir colaborador');
          console.error(err);
        },
      });
    }
  }

  onView(id: number) {
    this.router.navigate(['/colaboradores', id]);
  }

  onNew() {
    this.router.navigate(['/colaboradores/novo']);
  }
}
