export interface ColaboradorCreateDTO {
  nome: string;
  email: string;
  matricula: string;
  cpf: string;
  cargo: string;
  departamento: string;
  dataNascimento: string;
  dataAdmissao: string;
  supervisorId?: number | null;
  tagIds?: number[];
}