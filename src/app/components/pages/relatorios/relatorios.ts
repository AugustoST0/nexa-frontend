import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, FileText, Download } from 'lucide-angular';
import { Relatorio } from '../../../core/model/Relatorio.model';
import { RelatorioService } from '../../../core/services/crud/relatorio-service';
import { AlertService } from '../../../core/services/alert-service';
import { CardComponent } from '../../ui/card/card';
import { ButtonComponent } from '../../ui/button/button';

@Component({
  selector: 'app-relatorios',
  imports: [CommonModule, LucideAngularModule, CardComponent, ButtonComponent],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Relatorios implements OnInit {
  private readonly relatorioService = inject(RelatorioService);
  private readonly alertService = inject(AlertService);

  relatorios = signal<Relatorio[]>([]);
  loading = signal(false);

  readonly FileText = FileText;
  readonly Download = Download;

  ngOnInit() {
    this.loadRelatorios();
  }

  loadRelatorios() {
    this.loading.set(true);
    this.relatorioService.getAll().subscribe({
      next: (data) => {
        this.relatorios.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.alertService.error('Erro ao carregar relatórios');
        console.error(err);
        this.loading.set(false);
      },
    });
  }

  onDownloadPdf(id: number) {
    this.relatorioService.downloadPdf(id).subscribe({
      next: (blob) => this.downloadFile(blob, `relatorio-${id}.pdf`),
      error: (err) => {
        this.alertService.error('Erro ao baixar o PDF do relatório');
        console.error(err);
      },
    });
  }

  onDownloadCsv(id: number) {
    this.relatorioService.downloadCsv(id).subscribe({
      next: (blob) => this.downloadFile(blob, `relatorio-${id}.csv`),
      error: (err) => {
        this.alertService.error('Erro ao baixar o CSV do relatório');
        console.error(err);
      },
    });
  }

  private downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
