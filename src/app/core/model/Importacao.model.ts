export interface LinhaImport {
  numeroLinha: number;
  dados: Record<string, string>;
  erros: string[];
}

export interface ImportPreview {
  colunasDetectadas: string[];
  linhas: LinhaImport[];
}

export interface ImportResumo {
  totalImportados: number;
  totalIgnorados: number;
  linhasIgnoradas: LinhaImport[];
}
