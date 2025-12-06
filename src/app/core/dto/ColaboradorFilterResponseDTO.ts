// DTO baseado exatamente no FRONTEND_INTEGRATION_GUIDE.md
export interface ColaboradorFilterResponseDTO {
  id: number;
  nome: string;
  matricula: string;
  email: string;
  cpf: string;
  cargo: string;
  departamento: string;
  tags: TagResponse[];
  supervisor?: SupervisorResponse | null;
}

export interface TagResponse {
  id: number;
  nome: string;
}

export interface SupervisorResponse {
  id: number;
  nome: string;
}
