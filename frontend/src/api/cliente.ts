const ORIGEM_API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const BASE_API = `${ORIGEM_API}/api/v1`;

export type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ErroApi extends Error {
  readonly status: number;

  constructor(status: number, mensagem: string) {
    super(mensagem);
    this.name = 'ErroApi';
    this.status = status;
  }
}

type OpcoesRequisicao = {
  metodo?: Metodo;
  corpo?: unknown;
  consulta?: Record<string, string | number | boolean | undefined>;
};

type ValorConsulta = string | number | boolean | undefined;

export function montarConsulta(
  parametros: Record<string, ValorConsulta> = {},
): string {
  const partes = Object.entries(parametros)
    .filter(([, valor]) => valor !== undefined && valor !== '')
    .map(
      ([chave, valor]) =>
        `${encodeURIComponent(chave)}=${encodeURIComponent(String(valor))}`,
    );
  return partes.length > 0 ? `?${partes.join('&')}` : '';
}

async function mensagemDe(resposta: Response): Promise<string> {
  const corpo = (await resposta.json().catch(() => null)) as {
    message?: unknown;
  } | null;
  return typeof corpo?.message === 'string'
    ? corpo.message
    : `Erro ${resposta.status}`;
}

async function enviar(
  caminho: string,
  { metodo = 'GET', corpo, consulta = {} }: OpcoesRequisicao,
  aceitar: string,
): Promise<Response> {
  const cabecalhos: Record<string, string> = { Accept: aceitar };
  if (corpo !== undefined) {
    cabecalhos['Content-Type'] = 'application/json';
  }

  const resposta = await fetch(
    `${BASE_API}${caminho}${montarConsulta(consulta)}`,
    {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    },
  );

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, await mensagemDe(resposta));
  }
  return resposta;
}

export async function requisitar<T>(
  caminho: string,
  opcoes: OpcoesRequisicao = {},
): Promise<T> {
  const resposta = await enviar(caminho, opcoes, 'application/json');
  if (resposta.status === 204) {
    return undefined as T;
  }
  return (await resposta.json()) as T;
}

export async function requisitarTexto(
  caminho: string,
  opcoes: OpcoesRequisicao = {},
): Promise<string> {
  const resposta = await enviar(caminho, opcoes, 'text/csv');
  return resposta.text();
}
