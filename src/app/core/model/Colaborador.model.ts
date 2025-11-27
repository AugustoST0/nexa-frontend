import { Tag } from './Tag.model';

export interface Colaborador {
  id?: number;
  nome: string;
  email: string;
  matricula: string;
  cpf: string;
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  dataNascimento: string;
  supervisorId?: number | null;
  ativo?: boolean;
  tags?: Tag[];
}
