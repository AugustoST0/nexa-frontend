import { Tag } from './Tag';

export interface Colaborador {
  id?: number;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  dataNascimento: string;
  supervisorId?: number | null;
  ativo?: boolean;
  tags?: Tag[];
}
