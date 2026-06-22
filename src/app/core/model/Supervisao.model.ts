export interface Supervisao {
  id: number;
  supervisor: { id: number; nome: string };
  supervisionado: { id: number; nome: string };
  tipoSupervisor: { id: number; nome: string };
  dataInicio: string;
  dataFim?: string;
  observacoes?: string;
}

export interface TipoSupervisor {
  id: number;
  nome: string;
  descricao?: string;
  nivel?: number;
}
