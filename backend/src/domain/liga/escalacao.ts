import { compararNomes } from '../texto';
import { POSICOES, Posicao } from '../tipos';
import { Escalacao, Titular } from './placar';

export const FORMACOES = ['3-1', '2-2', '2-1-1', '1-2-1'] as const;

export type Formacao = (typeof FORMACOES)[number];

type Setores = { defesa: number; meio: number; ataque: number };

const SETORES_POR_FORMACAO: Record<Formacao, Setores> = {
  '3-1': { defesa: 3, meio: 0, ataque: 1 },
  '2-2': { defesa: 2, meio: 0, ataque: 2 },
  '2-1-1': { defesa: 2, meio: 1, ataque: 1 },
  '1-2-1': { defesa: 1, meio: 2, ataque: 1 },
};

export function ordenarElenco<
  T extends { id: number; nome: string; posicao: string },
>(jogadores: T[]): T[] {
  return [...jogadores].sort(
    (a, b) =>
      POSICOES.indexOf(a.posicao as Posicao) -
        POSICOES.indexOf(b.posicao as Posicao) ||
      compararNomes(a.nome, b.nome) ||
      a.id - b.id,
  );
}

export function ehEscalacaoValida(
  formacao: Formacao,
  posicoes: Posicao[],
): boolean {
  if (
    posicoes.length !== 5 ||
    posicoes.filter((posicao) => posicao === 'GOL').length !== 1
  ) {
    return false;
  }
  const contar = (...alvo: Posicao[]) =>
    posicoes.filter((posicao) => alvo.includes(posicao)).length;
  const setores = SETORES_POR_FORMACAO[formacao];
  return (
    contar('ZAG', 'LAT') === setores.defesa &&
    contar('MEI') === setores.meio &&
    contar('ATA') === setores.ataque
  );
}

export function montarEscalacao(titulares: Titular[]): Escalacao {
  const [goleiro, ...linha] = ordenarElenco(titulares);
  return { goleiro, linha: linha as Escalacao['linha'] };
}
