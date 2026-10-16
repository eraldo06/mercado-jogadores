import type { Response } from 'supertest';

export type JogadorJson = {
  id: number;
  name: string;
  position: string;
  agility: number;
  age: number;
  condition: string;
  base_value: number;
  market_value: number;
  pace: number;
  potential: number;
  overall: number;
  club_id: number | null;
};

export type ListaJogadoresJson = {
  data: JogadorJson[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
};

export type ErroJson = { message: string };

export type RespostaTipada<T> = {
  status: number;
  headers: Record<string, string | undefined>;
  text: string;
  body: T;
};

export async function tipar<T>(
  teste: PromiseLike<Response>,
): Promise<RespostaTipada<T>> {
  const res = await teste;
  return {
    status: res.status,
    headers: res.headers,
    text: res.text,
    body: res.body as T,
  };
}

export const nomesDe = (lista: ListaJogadoresJson): string[] =>
  lista.data.map((jogador) => jogador.name);
