import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { forkJoin, Subject, Subscription } from 'rxjs';
import { debounceTime, map, switchMap } from 'rxjs';
import { ColaboradorService } from '../../../core/services/crud/colaborador-service';
import { SupervisaoService } from '../../../core/services/crud/supervisao-service';
import { ImportacaoService } from '../../../core/services/crud/importacao-service';
import { ColaboradorWithCalcs } from '../../../core/model/ColaboradorWithCalcs.model';
import { Supervisao, TipoSupervisor } from '../../../core/model/Supervisao.model';
import { ImportPreview, LinhaImport, ImportResumo } from '../../../core/model/Importacao.model';
import { AlertService } from '../../../core/services/alert-service';
import { ModalService } from '../../../core/services/modal-service';
import { DetailModalConfig, DetailField } from '../../../core/model/DetailModalConfig.model';
import { ConfirmModalConfig } from '../../../core/model/ConfirmModalConfig.model';
import { ButtonComponent } from '../../ui/button/button';
import { CardComponent } from '../../ui/card/card';
import { ColaboradorFilterComponent } from '../../shared/colaborador-filter/colaborador-filter';
import { SearchableSelectComponent } from '../../shared/searchable-select/searchable-select';
import { LucideAngularModule, Eye, Edit, Trash2, Network, X, Users, UserMinus, ChevronUp, ChevronDown, Upload, Info } from 'lucide-angular';

@Component({
  selector: 'app-colaborador-list',
  imports: [CommonModule, FormsModule, RouterModule, ButtonComponent, CardComponent, ColaboradorFilterComponent, SearchableSelectComponent, LucideAngularModule],
  templateUrl: './colaborador-list.html',
  styleUrl: './colaborador-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColaboradorList implements OnInit, OnDestroy {
  private readonly colaboradorService = inject(ColaboradorService);
  private readonly supervisaoService = inject(SupervisaoService);
  private readonly importacaoService = inject(ImportacaoService);
  private readonly router = inject(Router);
  private readonly alertService = inject(AlertService);
  private readonly modalService = inject(ModalService);

  colaboradores = signal<ColaboradorWithCalcs[]>([]);
  loading = signal(false);
  buscaAtiva = signal(false);

  sortColumn = signal<string>('nome');
  sortDirection = signal<'asc' | 'desc'>('asc');

  colaboradoresOrdenados = computed(() => {
    const col = this.sortColumn();
    const dir = this.sortDirection();
    return [...this.colaboradores()].sort((a, b) => {
      const valA = String((a as any)[col] ?? '');
      const valB = String((b as any)[col] ?? '');
      return dir === 'asc'
        ? valA.localeCompare(valB, 'pt-BR')
        : valB.localeCompare(valA, 'pt-BR');
    });
  });

  toggleSort(column: string): void {
    if (this.sortColumn() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }

  readonly Eye = Eye;
  readonly Edit = Edit;
  readonly Trash2 = Trash2;
  readonly Network = Network;
  readonly X = X;
  readonly Users = Users;
  readonly UserMinus = UserMinus;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;
  readonly Upload = Upload;
  readonly Info = Info;

  // Modal "Gerenciar Supervisão"
  showSupervisaoModal = signal(false);
  supervisaoColab = signal<{ id: number; nome: string } | null>(null);
  supervisaoTab = signal<'ativos' | 'atribuir' | 'migrar' | 'historico'>('ativos');
  supervisoesAtivas = signal<Supervisao[]>([]);
  supervisoesHistorico = signal<Supervisao[]>([]);
  subordinadosAtivos = signal<Supervisao[]>([]);
  supervisorOptions = signal<ColaboradorWithCalcs[]>([]);
  tiposOptions = signal<TipoSupervisor[]>([]);
  formSupervisorId = signal('');
  formTipoId = signal('');
  formDataInicio = signal(new Date().toISOString().slice(0, 10));
  formMigrarSupervisorId = signal('');
  formMigrarTipoId = signal<string>('');

  canAtribuir = computed(() => !!this.formSupervisorId() && !!this.formTipoId());
  canMigrar = computed(() => !!this.formMigrarSupervisorId());

  supervisorSelectOptions = computed(() =>
    this.supervisorOptions().map((c) => ({ value: c.id!, label: c.nome }))
  );

  // Modal "Atribuir em Massa"
  showMassaModal = signal(false);
  massaSupervisorId = signal('');
  massaTipoId = signal('');
  massaDataInicio = signal(new Date().toISOString().slice(0, 10));
  massaSelecionados = signal<Set<number>>(new Set());

  canAtribuirMassa = computed(
    () => !!this.massaSupervisorId() && !!this.massaTipoId() && this.massaSelecionados().size > 0
  );

  // ===== Modal "Importar CSV" =====
  showImportModal = signal(false);
  importStep = signal<1 | 2 | 3>(1);
  importArquivo = signal<File | null>(null);
  importDelimitador = signal(';');
  importLoading = signal(false);
  previewData = signal<ImportPreview | null>(null);
  mapeamento = signal<Record<string, string>>({});
  formatoData = signal<Record<string, string>>({
    dataNascimento: 'dd/MM/yyyy',
    dataAdmissao: 'dd/MM/yyyy',
  });
  linhasValidadas = signal<LinhaImport[]>([]);
  importResumo = signal<ImportResumo | null>(null);

  linhasValidas = computed(() => this.linhasValidadas().filter(l => l.erros.length === 0));

  readonly camposSistema = [
    { key: 'nome',           label: 'Nome',              isDate: false },
    { key: 'matricula',      label: 'Matrícula',          isDate: false },
    { key: 'email',          label: 'Email',              isDate: false },
    { key: 'cpf',            label: 'CPF',                isDate: false },
    { key: 'dataNascimento', label: 'Data de Nascimento', isDate: true  },
    { key: 'dataAdmissao',   label: 'Data de Admissão',   isDate: true  },
    { key: 'cargo',          label: 'Cargo',              isDate: false },
    { key: 'departamento',   label: 'Departamento',       isDate: false },
  ];

  readonly formatosData = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy'];

  private readonly prefixosErro: Record<string, string[]> = {
    nome:           ['Nome'],
    matricula:      ['Matrícula', 'Matricula'],
    email:          ['Email'],
    cpf:            ['CPF'],
    dataNascimento: ['Data de nascimento'],
    dataAdmissao:   ['Data de admissão', 'Data de admissao'],
    cargo:          ['Cargo'],
    departamento:   ['Departamento'],
  };

  private readonly validacaoSubject = new Subject<{ linha: LinhaImport; campo: string }>();
  private validacaoSub?: Subscription;

  ngOnInit() {
    this.loadColaboradores();
    this.validacaoSub = this.validacaoSubject.pipe(
      debounceTime(500),
      switchMap(({ linha }) =>
        this.importacaoService.validar([linha.dados]).pipe(
          map(([resultado]) => ({ numeroLinha: linha.numeroLinha, erros: resultado.erros }))
        )
      )
    ).subscribe(({ numeroLinha, erros }) => {
      this.linhasValidadas.update(arr =>
        arr.map(l => l.numeroLinha === numeroLinha ? { ...l, erros } : l)
      );
    });
  }

  ngOnDestroy() {
    this.validacaoSub?.unsubscribe();
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
            this.loadColaboradores();
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
                {
                  label: 'Status',
                  value: colaborador.ativo ? 'Ativo' : 'Inativo',
                  type: 'badge',
                  badgeVariant: colaborador.ativo ? 'success' : 'danger'
                },
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

  // ===== Modal "Gerenciar Supervisão" =====
  openSupervisaoModal(colaborador: { id?: number; nome: string }) {
    this.supervisaoColab.set({ id: colaborador.id!, nome: colaborador.nome });
    this.supervisaoTab.set('ativos');
    this.formSupervisorId.set('');
    this.formTipoId.set('');
    this.formDataInicio.set(new Date().toISOString().slice(0, 10));
    this.formMigrarSupervisorId.set('');
    this.formMigrarTipoId.set('');
    this.showSupervisaoModal.set(true);
    this.loadSupervisoesAtivas(colaborador.id!);
    this.loadSubordinadosAtivos(colaborador.id!);
    this.loadHistorico(colaborador.id!);
    this.loadSupervisorOptions(colaborador.id!);
    this.loadTipos();
  }

  closeSupervisaoModal() {
    this.showSupervisaoModal.set(false);
    this.supervisaoColab.set(null);
  }

  loadSupervisoesAtivas(id: number) {
    this.supervisaoService.getSupervisoesPorColaborador(id).subscribe({
      next: (lista) => this.supervisoesAtivas.set(lista.filter((s) => !s.dataFim)),
      error: (err) => {
        this.alertService.error('Erro ao carregar supervisores ativos');
        console.error(err);
      },
    });
  }

  loadSubordinadosAtivos(id: number) {
    this.supervisaoService.getSupervisoesPorSupervisor(id).subscribe({
      next: (lista) => this.subordinadosAtivos.set(lista.filter((s) => !s.dataFim)),
      error: (err) => console.error(err),
    });
  }

  loadHistorico(id: number) {
    this.supervisaoService.getHistoricoPorColaborador(id).subscribe({
      next: (lista) => this.supervisoesHistorico.set(lista),
      error: (err) => console.error(err),
    });
  }

  desassociarSubordinado(supervisao: Supervisao) {
    this.supervisaoService.encerrar(supervisao.id).subscribe({
      next: () => {
        const colab = this.supervisaoColab();
        if (colab) {
          this.loadSubordinadosAtivos(colab.id);
        }
      },
      error: (err) => {
        this.alertService.error('Erro ao desassociar subordinado');
        console.error(err);
      },
    });
  }

  migrarSubordinados() {
    const colab = this.supervisaoColab();
    if (!colab || !this.canMigrar()) return;

    const novoSupervisorId = Number(this.formMigrarSupervisorId());
    this.supervisaoService.migrarTodos({
      supervisorAntigoId: colab.id,
      supervisorNovoId: novoSupervisorId,
      tipoSupervisorId: this.formMigrarTipoId() ? Number(this.formMigrarTipoId()) : undefined,
    }).subscribe({
      next: () => {
        this.alertService.success('Subordinados migrados com sucesso');
        this.loadSubordinadosAtivos(colab.id);
        this.loadSupervisoesAtivas(novoSupervisorId);
        this.formMigrarSupervisorId.set('');
        this.formMigrarTipoId.set('');
      },
      error: (err) => {
        this.alertService.error('Erro ao migrar subordinados');
        console.error(err);
      },
    });
  }

  loadSupervisorOptions(selfId: number) {
    this.colaboradorService.getAll().subscribe({
      next: (lista) => this.supervisorOptions.set(lista.filter((c) => c.id !== selfId)),
      error: (err) => console.error(err),
    });
  }

  loadTipos() {
    this.supervisaoService.getTipos().subscribe({
      next: (tipos) => this.tiposOptions.set(tipos),
      error: (err) => console.error(err),
    });
  }

  encerrarSupervisao(supervisao: Supervisao) {
    this.supervisaoService.encerrar(supervisao.id).subscribe({
      next: () => {
        const colab = this.supervisaoColab();
        if (colab) {
          this.loadSupervisoesAtivas(colab.id);
          this.loadHistorico(colab.id);
        }
      },
      error: (err) => {
        this.alertService.error('Erro ao encerrar supervisão');
        console.error(err);
      },
    });
  }

  atribuirSupervisor() {
    const colab = this.supervisaoColab();
    if (!colab || !this.canAtribuir()) return;

    this.supervisaoService.create({
      supervisor: { id: Number(this.formSupervisorId()) },
      supervisionado: { id: colab.id },
      tipoSupervisor: { id: Number(this.formTipoId()) },
      dataInicio: this.formDataInicio(),
    }).subscribe({
      next: () => {
        this.alertService.success('Supervisor atribuído com sucesso');
        this.formSupervisorId.set('');
        this.formTipoId.set('');
        this.loadSupervisoesAtivas(colab.id);
        this.loadHistorico(colab.id);
        this.supervisaoTab.set('ativos');
      },
      error: (err) => {
        this.alertService.error('Erro ao atribuir supervisor');
        console.error(err);
      },
    });
  }

  // ===== Modal "Atribuir em Massa" =====
  openMassaModal() {
    this.massaSupervisorId.set('');
    this.massaTipoId.set('');
    this.massaDataInicio.set(new Date().toISOString().slice(0, 10));
    this.massaSelecionados.set(new Set());
    this.supervisorOptions.set(this.colaboradores());
    this.loadTipos();
    this.showMassaModal.set(true);
  }

  closeMassaModal() {
    this.showMassaModal.set(false);
  }

  toggleMassa(id: number) {
    const set = new Set(this.massaSelecionados());
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    this.massaSelecionados.set(set);
  }

  selecionarTodosMassa() {
    this.massaSelecionados.set(new Set(this.colaboradores().map((c) => c.id!)));
  }

  limparSelecaoMassa() {
    this.massaSelecionados.set(new Set());
  }

  atribuirEmMassa() {
    if (!this.canAtribuirMassa()) return;

    const supervisorId = Number(this.massaSupervisorId());
    const tipoId = Number(this.massaTipoId());
    const dataInicio = this.massaDataInicio();
    const requests = Array.from(this.massaSelecionados()).map((id) =>
      this.supervisaoService.create({
        supervisor: { id: supervisorId },
        supervisionado: { id },
        tipoSupervisor: { id: tipoId },
        dataInicio,
      })
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.alertService.success('Supervisão atribuída em massa com sucesso');
        this.closeMassaModal();
        this.loadColaboradores();
      },
      error: (err) => {
        this.alertService.error('Erro ao atribuir supervisão em massa');
        console.error(err);
      },
    });
  }

  onNew() {
    this.router.navigate(['/colaboradores/novo']);
  }

  // ===== Modal "Importar CSV" =====
  openImportModal() {
    this.importStep.set(1);
    this.importArquivo.set(null);
    this.importDelimitador.set(';');
    this.importLoading.set(false);
    this.previewData.set(null);
    this.mapeamento.set({});
    this.formatoData.set({ dataNascimento: 'dd/MM/yyyy', dataAdmissao: 'dd/MM/yyyy' });
    this.linhasValidadas.set([]);
    this.importResumo.set(null);
    this.showImportModal.set(true);
  }

  closeImportModal() {
    this.showImportModal.set(false);
  }

  onImportFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.importArquivo.set(input.files?.[0] ?? null);
    this.previewData.set(null);
  }

  carregarPreview() {
    const file = this.importArquivo();
    if (!file) return;
    this.importLoading.set(true);
    this.importacaoService.preview(file, this.importDelimitador()).subscribe({
      next: (data) => {
        this.previewData.set(data);
        this.importLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao processar arquivo CSV');
        this.importLoading.set(false);
      },
    });
  }

  setMapeamento(campo: string, colunaCsv: string) {
    this.mapeamento.set({ ...this.mapeamento(), [campo]: colunaCsv });
  }

  setFormatoData(campo: string, formato: string) {
    this.formatoData.set({ ...this.formatoData(), [campo]: formato });
  }

  mapeamentoCompleto(): boolean {
    const map = this.mapeamento();
    return this.camposSistema.every(c => !!map[c.key]);
  }

  private converterData(valor: string, formato: string): string {
    if (!valor) return '';
    const partes = valor.split(/[\/\-]/);
    if (partes.length !== 3) return valor;
    if (formato === 'dd/MM/yyyy') return `${partes[2]}-${partes[1]}-${partes[0]}`;
    if (formato === 'MM/dd/yyyy') return `${partes[2]}-${partes[0]}-${partes[1]}`;
    return valor;
  }

  avancarParaValidacao() {
    const preview = this.previewData();
    if (!preview) return;
    const map = this.mapeamento();
    const fmts = this.formatoData();

    const linhasMapeadas: Record<string, string>[] = preview.linhas.map(linha => {
      const dados: Record<string, string> = {};
      for (const campo of this.camposSistema) {
        const colunaCsv = map[campo.key];
        let valor = colunaCsv ? (linha.dados[colunaCsv] ?? '') : '';
        if (campo.isDate && valor) {
          valor = this.converterData(valor, fmts[campo.key] ?? 'dd/MM/yyyy');
        }
        dados[campo.key] = valor;
      }
      return dados;
    });

    this.importLoading.set(true);
    this.importacaoService.validar(linhasMapeadas).subscribe({
      next: (linhas) => {
        this.linhasValidadas.set(linhas);
        this.importStep.set(2);
        this.importLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao validar linhas');
        this.importLoading.set(false);
      },
    });
  }

  campoComErro(linha: LinhaImport, campo: string): boolean {
    if (!linha.erros.length) return false;
    const prefixos = this.prefixosErro[campo] ?? [];
    return linha.erros.some(e =>
      prefixos.some(p => e.toLowerCase().startsWith(p.toLowerCase()))
    );
  }

  atualizarCelula(linha: LinhaImport, campo: string, valor: string) {
    linha.dados[campo] = valor;
    this.validacaoSubject.next({ linha, campo });
  }

  confirmarImportacao() {
    this.importLoading.set(true);
    this.importacaoService.confirmar(this.linhasValidadas()).subscribe({
      next: (resumo) => {
        this.importResumo.set(resumo);
        this.importStep.set(3);
        this.importLoading.set(false);
      },
      error: () => {
        this.alertService.error('Erro ao importar colaboradores');
        this.importLoading.set(false);
      },
    });
  }

  concluirImportacao() {
    this.closeImportModal();
    this.loadColaboradores();
  }
}
