import { Grupo } from './Grupo.model';

export interface Tag {
  id?: number;
  nome: string;
  descricao?: string;
  grupo?: Grupo;
  grupoId?: number;
}
