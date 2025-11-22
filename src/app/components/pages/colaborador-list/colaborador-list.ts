import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ColaboradorService } from '../../../core/services/colaborador-service';
import { ColaboradorWithCalcs } from '../../../core/model/ColaboradorWithCalcs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-colaborador-list',
  imports: [CommonModule, RouterModule],
  templateUrl: './colaborador-list.html',
  styleUrl: './colaborador-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColaboradorList implements OnInit {
  private readonly colaboradorService = inject(ColaboradorService);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);

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
        this.toastr.error('Erro ao carregar colaboradores', 'Erro');
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
          this.toastr.success('Colaborador excluído com sucesso', 'Sucesso');
          this.loadColaboradores();
        },
        error: (err) => {
          this.toastr.error('Erro ao excluir colaborador', 'Erro');
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
