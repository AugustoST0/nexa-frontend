import { Grupo } from '../model/Grupo.model';

/**
 * Um grupo conta como "pesquisa salva" se tiver tokens de tag OU
 * algum filtro adicional preenchido (supervisor / intervalo de admissão).
 */
export function isPesquisaSalva(g: Grupo): boolean {
  return (
    (g.tokens?.length ?? 0) > 0 ||
    (g.supervisorIds?.length ?? 0) > 0 ||
    !!g.dataAdmissaoInicio ||
    !!g.dataAdmissaoFim
  );
}
