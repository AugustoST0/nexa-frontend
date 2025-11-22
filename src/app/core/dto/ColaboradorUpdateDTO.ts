export interface ColaboradorUpdateDTO {
  nome?: string;
  email?: string;
  cargo?: string;
  departamento?: string;
  dataNascimento?: string;
  dataAdmissao?: string;
  supervisorId?: number | null;
  tagIds?: number[];
  ativo?: boolean;
}