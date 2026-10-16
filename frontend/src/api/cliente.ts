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
};

async function mensagemDe(resposta: Response): Promise<string> {
  const corpo = (await resposta.json().catch(() => null)) as {
    message?: unknown;
  } | null;
  return typeof corpo?.message === 'string'
    ? corpo.message
    : `Erro ${resposta.status}`;
}

export async function requisitar<T>(
  caminho: string,
  { metodo = 'GET', corpo }: OpcoesRequisicao = {},
): Promise<T> {
  const resposta = await fetch(`${BASE_API}${caminho}`, {
    method: metodo,
    headers:
      corpo === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: corpo === undefined ? undefined : JSON.stringify(corpo),
  });

  if (!resposta.ok) {
    throw new ErroApi(resposta.status, await mensagemDe(resposta));
  }
  if (resposta.status === 204) {
    return undefined as T;
  }
  return (await resposta.json()) as T;
}
