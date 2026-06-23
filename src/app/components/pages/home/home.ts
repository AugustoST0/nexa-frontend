import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LucideAngularModule, Search, FileText } from 'lucide-angular';
import { GrupoService } from '../../../core/services/crud/grupo-service';
import { RelatorioService } from '../../../core/services/crud/relatorio-service';
import { ColaboradorService } from '../../../core/services/crud/colaborador-service';
import { AuthService } from '../../../core/services/auth-service';
import { AlertService } from '../../../core/services/alert-service';
import { Grupo } from '../../../core/model/Grupo.model';
import { Relatorio } from '../../../core/model/Relatorio.model';
import { isPesquisaSalva } from '../../../core/utils/grupo.util';
import { CardComponent } from '../../ui/card/card';

const OPERADORES = ['E', 'OU', 'NÃO POSSUI'];

@Component({
  selector: 'app-home',
  imports: [CommonModule, LucideAngularModule, CardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  private readonly grupoService = inject(GrupoService);
  private readonly relatorioService = inject(RelatorioService);
  private readonly colaboradorService = inject(ColaboradorService);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);
  private readonly router = inject(Router);

  readonly Search = Search;
  readonly FileText = FileText;

  userName = signal('');
  pesquisasRecentes = signal<Grupo[]>([]);
  pesquisaCounts = signal<Record<number, number>>({});
  relatoriosRecentes = signal<Relatorio[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      this.userName.set(user?.name ?? '');
    });

    this.loading.set(true);
    forkJoin({
      grupos: this.grupoService.getAll(),
      relatorios: this.relatorioService.getAll(),
    }).subscribe({
      next: ({ grupos, relatorios }) => {
        const recentes = grupos.filter(isPesquisaSalva).slice(-3).reverse();
        this.pesquisasRecentes.set(recentes);
        this.loadPesquisaCounts(recentes);
        this.relatoriosRecentes.set(relatorios.slice(0, 3));
        this.loading.set(false);
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar dados do painel');
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  private loadPesquisaCounts(pesquisas: Grupo[]) {
    for (const pesquisa of pesquisas) {
      if (!pesquisa.id) continue;
      const id = pesquisa.id;
      this.colaboradorService.searchAdvanced({
        tokens: pesquisa.tokens,
        supervisorIds: pesquisa.supervisorIds,
        dataAdmissaoInicio: pesquisa.dataAdmissaoInicio,
        dataAdmissaoFim: pesquisa.dataAdmissaoFim,
      }).subscribe({
        next: (colaboradores) => {
          this.pesquisaCounts.update((counts) => ({ ...counts, [id]: colaboradores.length }));
        },
        error: (err) => {
          console.error('Erro ao contar colaboradores da pesquisa', id, err);
        },
      });
    }
  }

  isOperador(token: string): boolean {
    return OPERADORES.includes(token);
  }

  formatarData(criadoEm?: string): string {
    if (!criadoEm) return 'Data não disponível';
    const d = new Date(criadoEm);
    return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  verPesquisas() {
    this.router.navigate(['/catalogo'], { queryParams: { tab: 'pesquisas' } });
  }

  verRelatorios() {
    this.router.navigate(['/relatorios']);
  }
}
