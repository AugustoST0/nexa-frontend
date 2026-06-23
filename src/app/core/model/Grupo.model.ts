export interface Grupo {
  id?: number;
  nome: string;
  descricao?: string;
  tagIds?: number[];
  tokens?: string[];
  supervisorIds?: number[];
  dataAdmissaoInicio?: string;
  dataAdmissaoFim?: string;
  criadoEm?: string;
}
