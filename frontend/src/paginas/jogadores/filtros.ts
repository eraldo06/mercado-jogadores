import { moeda } from '../../lib/formatar';
import type { FiltrosJogadores } from '../../api/jogadores';
import type { Condicao, Posicao } from '../../api/tipos';

export type AbaJogadores = 'todos' | 'livres' | 'clubes';

export type OrdemJogadores =
  'name' | 'value_desc' | 'value_asc' | 'age_desc' | 'age_asc' | 'position';

export type EstadoJogadores = {
  busca: string;
  posicao?: Posicao;
  condicao?: Condicao;
  clube?: number;
  aba: AbaJogadores;
  idadeMin?: number;
  idadeMax?: number;
  valorMin?: string;
  valorMax?: string;
  ordem: OrdemJogadores;
  pagina: number;
};

export const TAMANHO_PAGINA = 10;

export const ROTULO_POSICAO: Record<Posicao, string> = {
  GOL: 'Goleiro',
  ZAG: 'Zagueiro',
  LAT: 'Lateral',
  MEI: 'Meio-campo',
  ATA: 'Atacante',
};

export const ROTULO_CONDICAO: Record<Condicao, string> = {
  APTO: 'Apto',
  MAL_CONDICIONADO: 'Mal condicionado',
  DOENTE: 'Doente',
};

export const ROTULO_ORDEM: Record<OrdemJogadores, string> = {
  name: 'Nome',
  value_desc: 'Maior valor de mercado',
  value_asc: 'Menor valor de mercado',
  age_desc: 'Maior idade',
  age_asc: 'Menor idade',
  position: 'Posição (GOL a ATA)',
};

const POSICOES = Object.keys(ROTULO_POSICAO) as Posicao[];
const CONDICOES = Object.keys(ROTULO_CONDICAO) as Condicao[];
const ORDENS = Object.keys(ROTULO_ORDEM) as OrdemJogadores[];
const ABAS: AbaJogadores[] = ['todos', 'livres', 'clubes'];

function inteiro(valor: string | null): number | undefined {
  return valor && /^\d+$/.test(valor) ? Number(valor) : undefined;
}

function escolha<T extends string>(
  valor: string | null,
  validos: readonly T[],
): T | undefined {
  return validos.find((item) => item === valor);
}

export function lerEstado(parametros: URLSearchParams): EstadoJogadores {
  return {
    busca: parametros.get('busca') ?? '',
    posicao: escolha(parametros.get('posicao'), POSICOES),
    condicao: escolha(parametros.get('condicao'), CONDICOES),
    clube: inteiro(parametros.get('clube')),
    aba: escolha(parametros.get('aba'), ABAS) ?? 'todos',
    idadeMin: inteiro(parametros.get('idade_min')),
    idadeMax: inteiro(parametros.get('idade_max')),
    valorMin: parametros.get('valor_min') ?? undefined,
    valorMax: parametros.get('valor_max') ?? undefined,
    ordem: escolha(parametros.get('ordem'), ORDENS) ?? 'name',
    pagina: Math.max(1, inteiro(parametros.get('pagina')) ?? 1),
  };
}

export function escreverEstado(estado: EstadoJogadores): URLSearchParams {
  const parametros = new URLSearchParams();
  const definir = (chave: string, valor: string | number | undefined) => {
    if (valor !== undefined && valor !== '') {
      parametros.set(chave, String(valor));
    }
  };
  definir('busca', estado.busca.trim());
  definir('posicao', estado.posicao);
  definir('condicao', estado.condicao);
  definir('clube', estado.clube);
  if (estado.aba !== 'todos') definir('aba', estado.aba);
  definir('idade_min', estado.idadeMin);
  definir('idade_max', estado.idadeMax);
  definir('valor_min', estado.valorMin);
  definir('valor_max', estado.valorMax);
  if (estado.ordem !== 'name') definir('ordem', estado.ordem);
  if (estado.pagina > 1) definir('pagina', estado.pagina);
  return parametros;
}

function filtrosComuns(estado: EstadoJogadores): FiltrosJogadores {
  const busca = estado.busca.trim();
  return {
    search: busca.length >= 2 ? busca : undefined,
    position: estado.posicao,
    condition: estado.condicao,
    min_age: estado.idadeMin,
    max_age: estado.idadeMax,
    min_value:
      estado.valorMin === undefined ? undefined : Number(estado.valorMin),
    max_value:
      estado.valorMax === undefined ? undefined : Number(estado.valorMax),
  };
}

function livreDaAba(aba: AbaJogadores): boolean | undefined {
  if (aba === 'livres') return true;
  if (aba === 'clubes') return false;
  return undefined;
}

export function filtrosLista(estado: EstadoJogadores): FiltrosJogadores {
  return {
    ...filtrosComuns(estado),
    free: livreDaAba(estado.aba),
    club_id: estado.aba === 'livres' ? undefined : estado.clube,
    sort: estado.ordem,
    page: estado.pagina,
    limit: TAMANHO_PAGINA,
  };
}

export function filtrosContagem(
  estado: EstadoJogadores,
  aba: AbaJogadores,
): FiltrosJogadores {
  return {
    ...filtrosComuns(estado),
    free: livreDaAba(aba),
    club_id: aba === 'livres' ? undefined : estado.clube,
  };
}

export function filtrosAtivos(estado: EstadoJogadores): boolean {
  return (
    estado.busca.trim() !== '' ||
    estado.posicao !== undefined ||
    estado.condicao !== undefined ||
    estado.clube !== undefined ||
    estado.aba !== 'todos' ||
    estado.idadeMin !== undefined ||
    estado.idadeMax !== undefined ||
    estado.valorMin !== undefined ||
    estado.valorMax !== undefined
  );
}

export function textoFaixa(minimo?: string, maximo?: string): string {
  return `${minimo ?? '—'} a ${maximo ?? '—'}`;
}

export function textoFaixaValor(minimo?: string, maximo?: string): string {
  const formatar = (valor?: string) =>
    valor === undefined ? '—' : moeda(Number(valor));
  return `${formatar(minimo)} a ${formatar(maximo)}`;
}
