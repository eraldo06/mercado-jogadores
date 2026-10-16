import { compararNomes } from '../texto';

const PONTOS_VITORIA = 3;
const PONTOS_EMPATE = 1;

export type ClubeNaTabela = { id: number; nome: string };

export type PartidaNaTabela = {
  mandanteId: number;
  visitanteId: number;
  golsMandante: number;
  golsVisitante: number;
};

export type LinhaClassificacao = {
  posicao: number;
  clubeId: number;
  nome: string;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldo: number;
  pontos: number;
};

type Acumulado = Omit<LinhaClassificacao, 'posicao'>;

function novaLinha(clube: ClubeNaTabela): Acumulado {
  return {
    clubeId: clube.id,
    nome: clube.nome,
    jogos: 0,
    vitorias: 0,
    empates: 0,
    derrotas: 0,
    golsPro: 0,
    golsContra: 0,
    saldo: 0,
    pontos: 0,
  };
}

function registrar(linha: Acumulado, golsPro: number, golsContra: number) {
  linha.jogos += 1;
  linha.golsPro += golsPro;
  linha.golsContra += golsContra;
  linha.saldo = linha.golsPro - linha.golsContra;
  if (golsPro > golsContra) {
    linha.vitorias += 1;
    linha.pontos += PONTOS_VITORIA;
  } else if (golsPro === golsContra) {
    linha.empates += 1;
    linha.pontos += PONTOS_EMPATE;
  } else {
    linha.derrotas += 1;
  }
}

export function calcularClassificacao(
  clubes: ClubeNaTabela[],
  partidas: PartidaNaTabela[],
): LinhaClassificacao[] {
  const linhas = new Map(clubes.map((clube) => [clube.id, novaLinha(clube)]));

  for (const partida of partidas) {
    const mandante = linhas.get(partida.mandanteId);
    const visitante = linhas.get(partida.visitanteId);
    if (!mandante || !visitante) {
      continue;
    }
    registrar(mandante, partida.golsMandante, partida.golsVisitante);
    registrar(visitante, partida.golsVisitante, partida.golsMandante);
  }

  return [...linhas.values()]
    .sort(
      (a, b) =>
        b.pontos - a.pontos ||
        b.saldo - a.saldo ||
        b.golsPro - a.golsPro ||
        compararNomes(a.nome, b.nome) ||
        a.clubeId - b.clubeId,
    )
    .map((linha, indice) => ({ ...linha, posicao: indice + 1 }));
}
