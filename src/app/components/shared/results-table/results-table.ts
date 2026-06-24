import { Component, EventEmitter, Input, Output, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ColaboradorFilterResponseDTO } from '../../../core/dto/ColaboradorFilterResponseDTO';
import { ColaboradorService } from '../../../core/services/crud/colaborador-service';
import { SupervisaoService } from '../../../core/services/crud/supervisao-service';
import { AlertService } from '../../../core/services/alert-service';
import { ModalService } from '../../../core/services/modal-service';
import { DetailModalConfig, DetailField } from '../../../core/model/DetailModalConfig.model';
import { ConfirmModalConfig } from '../../../core/model/ConfirmModalConfig.model';
import { ButtonComponent } from '../../ui/button/button';
import { LucideAngularModule, Eye, Edit, Trash2, Network, ChevronUp, ChevronDown } from 'lucide-angular';

@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LucideAngularModule],
  templateUrl: './results-table.html',
  styleUrls: ['./results-table.css'],
})
export class ResultsTableComponent {
  @Input() resultados: ColaboradorFilterResponseDTO[] = [];
  @Input() loading: boolean = false;
  @Input() mensagem: string = '';
  @Output() gerenciarSupervisao = new EventEmitter<ColaboradorFilterResponseDTO>();

  private readonly router = inject(Router);
  private readonly colaboradorService = inject(ColaboradorService);
  private readonly supervisaoService = inject(SupervisaoService);
  private readonly alertService = inject(AlertService);
  private readonly modalService = inject(ModalService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly Eye = Eye;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Network = Network;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;

  sortColumn = 'nome';
  sortDirection: 'asc' | 'desc' = 'asc';

  toggleSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  get resultadosOrdenados(): ColaboradorFilterResponseDTO[] {
    return [...this.resultados].sort((a, b) => {
      let valA: string;
      let valB: string;
      if (this.sortColumn === 'supervisor') {
        valA = a.supervisor?.nome ?? '';
        valB = b.supervisor?.nome ?? '';
      } else {
        valA = String((a as any)[this.sortColumn] ?? '');
        valB = String((b as any)[this.sortColumn] ?? '');
      }
      return this.sortDirection === 'asc'
        ? valA.localeCompare(valB, 'pt-BR')
        : valB.localeCompare(valA, 'pt-BR');
    });
  }

  onGerenciarSupervisao(resultado: ColaboradorFilterResponseDTO) {
    this.gerenciarSupervisao.emit(resultado);
  }

  onEdit(id: number) {
    this.router.navigate(['/colaboradores/editar', id]);
  }

  onDelete(id: number, nome: string) {
    const config: ConfirmModalConfig = {
      title: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o colaborador ${nome}?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      type: 'danger',
    };

    this.modalService.showConfirm(config).subscribe((confirmed) => {
      if (confirmed) {
        this.colaboradorService.delete(id).subscribe({
          next: () => {
            this.alertService.success('Colaborador excluído com sucesso');
            // Remover o colaborador da lista de resultados
            this.resultados = this.resultados.filter(r => r.id !== id);
            this.cdr.detectChanges(); // Força detecção de mudanças
          },
          error: (err) => {
            this.alertService.error('Erro ao excluir colaborador');
            console.error(err);
          },
        });
      }
    });
  }

  onView(id: number) {
    forkJoin({
      colaborador: this.colaboradorService.getById(id),
      supervisores: this.supervisaoService.getSupervisoesPorColaborador(id),
      subordinados: this.supervisaoService.getSupervisoesPorSupervisor(id),
    }).subscribe({
      next: ({ colaborador, supervisores, subordinados }) => {
        const nomesSupervisores = supervisores
          .filter((s) => !s.dataFim)
          .map((s) => `${s.supervisor.nome} (${s.tipoSupervisor.nome})`);
        const nomesSubordinados = subordinados
          .filter((s) => !s.dataFim)
          .map((s) => s.supervisionado.nome);

        const supervisoresField: DetailField = nomesSupervisores.length
          ? { label: 'Supervisores', value: nomesSupervisores, type: 'list' }
          : { label: 'Supervisores', value: 'Nenhum' };
        const subordinadosField: DetailField = nomesSubordinados.length
          ? { label: 'Subordinados', value: nomesSubordinados, type: 'list' }
          : { label: 'Subordinados', value: 'Nenhum' };

        const config: DetailModalConfig = {
          title: colaborador.nome,
          sections: [
            {
              title: 'Informações Pessoais',
              fields: [
                { label: 'Nome', value: colaborador.nome },
                { label: 'Email', value: colaborador.email },
                { label: 'CPF', value: colaborador.cpf },
                { label: 'Data de Nascimento', value: colaborador.dataNascimento, type: 'date' },
              ],
            },
            {
              title: 'Informações Profissionais',
              fields: [
                { label: 'Matrícula', value: colaborador.matricula },
                { label: 'Cargo', value: colaborador.cargo },
                { label: 'Departamento', value: colaborador.departamento },
                { label: 'Data de Admissão', value: colaborador.dataAdmissao, type: 'date' },
                { label: 'Tempo de Empresa', value: colaborador.tempoEmpresa },
              ],
            },
            {
              title: 'Hierarquia',
              fields: [supervisoresField, subordinadosField],
            },
            {
              title: 'Tags',
              fields: [
                {
                  label: 'Tags',
                  value: colaborador.tags || [],
                  type: 'list'
                },
              ],
            },
          ],
          closeText: 'Fechar',
        };
        this.modalService.showDetail(config);
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar detalhes do colaborador');
        console.error(err);
      },
    });
  }
}
