import { Grupo } from './Grupo';

export interface Tag {
  id?: number;
  nome: string;
  descricao?: string;
  grupo?: Grupo;
  grupoId?: number;
}
