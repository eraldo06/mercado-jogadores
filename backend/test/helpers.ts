import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Server } from 'http';
import type { Response } from 'supertest';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configurarApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';

const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;
const MILISSEGUNDOS_POR_HORA = 60 * 60 * 1000;

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

export type ClubeJson = {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
};

export type ContratoJson = {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
};

export type ClubeDetalheJson = ClubeJson & {
  players: (JogadorJson & { contract: ContratoJson })[];
};

export type CompraJson = {
  id: number;
  club_id: number;
  player_id: number;
  type: string;
  value: number;
  fee: number;
  cash_change: number;
  club_cash: number;
  created_at: string;
  contract: { purchase_value: number; loyalty_until: string; status: string };
};

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

export async function iniciarApp(): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = moduleRef.createNestApplication({ bodyParser: false });
  configurarApp(app, process.env.CORS_ORIGIN as string);
  await app.init();
  return { app, prisma: app.get(PrismaService) };
}

export const apiDe = (app: INestApplication) =>
  request(app.getHttpServer() as Server);

export async function limparBanco(prisma: PrismaService): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE duelos_partida, partidas, escalacoes, transacoes, contratos, jogadores, clubes RESTART IDENTITY CASCADE',
  );
}

export function paraBrasilia(instante: Date): string {
  const brasilia = new Date(instante.getTime() - 3 * MILISSEGUNDOS_POR_HORA);
  return `${brasilia.toISOString().slice(0, 16)}-03:00`;
}

export const emDias = (dias: number): Date =>
  new Date(Date.now() + dias * MILISSEGUNDOS_POR_DIA);
