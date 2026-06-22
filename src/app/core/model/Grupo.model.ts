export interface Grupo {
  id?: number;
  nome: string;
  descricao?: string;
  tagIds?: number[];
  tokens?: string[];
  supervisorId?: number;
  dataAdmissaoInicio?: string;
  dataAdmissaoFim?: string;
  criadoEm?: string;
}
