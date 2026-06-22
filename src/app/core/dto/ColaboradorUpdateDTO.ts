export interface ColaboradorUpdateDTO {
  nome?: string;
  email?: string;
  matricula?: string;
  cpf?: string;
  cargo?: string;
  departamento?: string;
  dataNascimento?: string;
  dataAdmissao?: string;
  tagIds?: number[];
  ativo?: boolean;
}