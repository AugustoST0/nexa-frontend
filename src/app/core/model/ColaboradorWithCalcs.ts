import { Colaborador } from './Colaborador';

export interface ColaboradorWithCalcs extends Colaborador {
  idade: string; // Ex: "34 anos"
  tempoEmpresa: string; // Ex: "2a 10m"
  supervisor?: ColaboradorWithCalcs | null;
  subordinados?: ColaboradorWithCalcs[];
}