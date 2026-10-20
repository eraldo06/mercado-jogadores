import type { PartidaDetalhe, ParticipanteDuelo } from '../../api/liga';
import type { Condicao, Posicao } from '../../api/tipos';
import { SIGLA_ATRIBUTO } from './rotulos-partida';

export type JogadorNoCampo = {
  id: number;
  nome: string;
  posicao: Posicao;
  condicao: Condicao;
  mandante: boolean;
  gol: boolean;
  ataque: { sigla: string; valor: number } | null;
  defesa: number | null;
};

type Linha = 'GOL' | 'DEF' | 'MEI' | 'ATA';

const LINHA_DA_POSICAO: Record<Posicao, Linha> = {
  GOL: 'GOL',
  ZAG: 'DEF',
  LAT: 'DEF',
  MEI: 'MEI',
  ATA: 'ATA',
};

// x de cada linha no lado do mandante, que ataca para a direita; o visitante espelha
const X_DA_LINHA_DO_MANDANTE: Record<Linha, number> = {
  GOL: 6,
  DEF: 17,
  MEI: 29,
  ATA: 39,
};

// Junta os titulares dos 6 duelos. Cada titular entra uma vez, com o atributo do
// ataque e o valor da defesa que ele usou (valores já com o efeito da condição).
export function jogadoresNoCampo(partida: PartidaDetalhe): JogadorNoCampo[] {
  const jogadores = new Map<number, JogadorNoCampo>();

  const registrar = (p: ParticipanteDuelo, mandante: boolean) => {
    let jogador = jogadores.get(p.player_id);
    if (!jogador) {
      jogador = {
        id: p.player_id,
        nome: p.player_name,
        posicao: p.position,
        condicao: p.condition,
        mandante,
        gol: false,
        ataque: null,
        defesa: null,
      };
      jogadores.set(p.player_id, jogador);
    }
    return jogador;
  };

  for (const duelo of partida.duels) {
    const mandanteAtaca = duelo.attacking_club_id === partida.home.club_id;
    const atacante = registrar(duelo.attacker, mandanteAtaca);
    atacante.ataque = {
      sigla:
        SIGLA_ATRIBUTO[duelo.attacker.attribute] ?? duelo.attacker.attribute,
      valor: duelo.attacker.value,
    };
    if (duelo.goal) atacante.gol = true;

    const defensor = registrar(duelo.defender, !mandanteAtaca);
    defensor.defesa = duelo.defender.value;
  }

  return [...jogadores.values()];
}

// Posição de cada titular no campo: linha pelo setor, e altura pela ordem dentro da linha
export function posicionarNoCampo(jogadores: JogadorNoCampo[]) {
  const posicoes: { jogador: JogadorNoCampo; x: number; y: number }[] = [];
  for (const mandante of [true, false]) {
    const doLado = jogadores.filter((j) => j.mandante === mandante);
    for (const linha of ['GOL', 'DEF', 'MEI', 'ATA'] as const) {
      const daLinha = doLado.filter(
        (j) => LINHA_DA_POSICAO[j.posicao] === linha,
      );
      daLinha.forEach((jogador, indice) => {
        const x = X_DA_LINHA_DO_MANDANTE[linha];
        posicoes.push({
          jogador,
          x: mandante ? x : 100 - x,
          y: ((indice + 1) / (daLinha.length + 1)) * 100,
        });
      });
    }
  }
  return posicoes;
}
