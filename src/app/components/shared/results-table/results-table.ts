import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ColaboradorFilterResponseDTO } from '../../../core/dto/ColaboradorFilterResponseDTO';
import { ColaboradorService } from '../../../core/services/crud/colaborador-service';
import { AlertService } from '../../../core/services/alert-service';
import { ModalService } from '../../../core/services/modal-service';
import { DetailModalConfig } from '../../../core/model/DetailModalConfig.model';
import { ConfirmModalConfig } from '../../../core/model/ConfirmModalConfig.model';
import { ButtonComponent } from '../../ui/button/button';
import { LucideAngularModule, Eye, Edit, Trash2 } from 'lucide-angular';

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

  private readonly router = inject(Router);
  private readonly colaboradorService = inject(ColaboradorService);
  private readonly alertService = inject(AlertService);
  private readonly modalService = inject(ModalService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly Eye = Eye;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;

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
    this.colaboradorService.getById(id).subscribe({
      next: (colaborador) => {
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
              fields: [
                {
                  label: 'Supervisor',
                  value: colaborador.supervisor?.nome || 'Nenhum'
                },
                {
                  label: 'Subordinados',
                  value: colaborador.subordinados || [],
                  type: 'list'
                },
              ],
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
