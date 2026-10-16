import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  apiDe,
  ClubeDetalheJson,
  ClubeJson,
  CompraJson,
  emDias,
  ErroJson,
  iniciarApp,
  JogadorJson,
  limparBanco,
  paraBrasilia,
  tipar,
} from './helpers';

const FIM_PADRAO = () => paraBrasilia(emDias(365));

const comSegundos = (fim: string) => fim.replace('-03:00', ':00-03:00');

const jogadorValido = {
  name: 'Joao Silva',
  position: 'MEI',
  agility: 50,
  age: 25,
  pace: 60,
  shooting: 60,
  passing: 60,
  dribbling: 60,
  defending: 60,
  physical: 60,
  potential: 70,
};

describe('Compra (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const api = () => apiDe(app);

  async function jogadorLivre(
    valorBase: number,
    { condicao = 'APTO', idade = 25, agilidade = 50 } = {},
  ): Promise<number> {
    const criado = await tipar<JogadorJson>(
      api()
        .post('/api/v1/players')
        .send({ ...jogadorValido, age: idade, agility: agilidade }),
    );
    await prisma.jogador.update({
      where: { id: criado.body.id },
      data: { valorBase, condicao, idade, agilidade },
    });
    return criado.body.id;
  }

  async function clubeComCaixa(
    caixa: number,
    nome = 'Aguias FC',
    sigla = 'AGU',
  ): Promise<number> {
    const criado = await tipar<ClubeJson>(
      api().post('/api/v1/clubs').send({ name: nome, acronym: sigla }),
    );
    await prisma.clube.update({
      where: { id: criado.body.id },
      data: { caixa },
    });
    return criado.body.id;
  }

  const comprar = (jogadorId: number, clubeId: number, fim = FIM_PADRAO()) =>
    tipar<CompraJson>(
      api()
        .post(`/api/v1/players/${jogadorId}/buy`)
        .send({ club_id: clubeId, loyalty_until: fim }),
    );

  const caixaDo = async (clubeId: number) =>
    (
      await prisma.clube.findUniqueOrThrow({ where: { id: clubeId } })
    ).caixa.toNumber();

  const clubeDoJogador = async (jogadorId: number) =>
    (await prisma.jogador.findUniqueOrThrow({ where: { id: jogadorId } }))
      .clubeId;

  const contratos = (jogadorId: number) =>
    prisma.contrato.count({ where: { jogadorId } });

  const compras = () => prisma.transacao.count({ where: { tipo: 'COMPRA' } });

  async function expectNadaGravado(
    jogadorId: number,
    caixa?: number,
    clubeId?: number,
  ) {
    expect(await clubeDoJogador(jogadorId)).toBeNull();
    expect(await contratos(jogadorId)).toBe(0);
    expect(await compras()).toBe(0);
    if (caixa !== undefined && clubeId !== undefined) {
      expect(await caixaDo(clubeId)).toBe(caixa);
    }
  }

  beforeAll(async () => {
    ({ app, prisma } = await iniciarApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await limparBanco(prisma);
  });

  describe('B10 – compra com taxa, limite de 50% do caixa e contrato', () => {
    it.each([
      [300, 28, 0, 28, true],
      [300, 30, 0, 30, true],
      [300, 30.01, 1.5, 31.51, true],
      [100, 47.62, 2.38, 50, true],
      [100, 48, 2.4, 50.4, false],
      [261.15, 124.35, 6.22, 130.57, true],
      [261.15, 124.36, 6.22, 130.58, false],
    ] as const)(
      'caixa %p, valor %p, taxa %p, custo %p, aceita %p (RN13)',
      async (caixa, valor, taxa, custo, aceita) => {
        const clube = await clubeComCaixa(caixa);
        const jogador = await jogadorLivre(valor);

        const res = await comprar(jogador, clube);

        if (!aceita) {
          expect(res.status).toBe(409);
          expect(res.body.message).toEqual(expect.any(String));
          await expectNadaGravado(jogador, caixa, clube);
          return;
        }

        expect(res.status).toBe(200);
        expect(res.body.value).toBe(valor);
        expect(res.body.fee).toBe(taxa);
        expect(res.body.cash_change).toBeCloseTo(-custo, 2);
        expect(res.body.club_cash).toBeCloseTo(caixa - custo, 2);
        expect(await clubeDoJogador(jogador)).toBe(clube);
        expect(await caixaDo(clube)).toBeCloseTo(caixa - custo, 2);
        expect(await compras()).toBe(1);
      },
    );

    it('cria contrato ATIVO com o valor de compra e a transação COMPRA', async () => {
      const clube = await clubeComCaixa(300);
      const jogador = await jogadorLivre(40);

      const res = await comprar(jogador, clube);
      const contrato = await prisma.contrato.findFirstOrThrow({
        where: { jogadorId: jogador },
      });
      const transacao = await prisma.transacao.findFirstOrThrow({
        where: { jogadorId: jogador },
      });

      expect(res.body.contract.status).toBe('ATIVO');
      expect(res.body.contract.purchase_value).toBe(40);
      expect(contrato.situacao).toBe('ATIVO');
      expect(contrato.valorCompra.toNumber()).toBe(40);
      expect(transacao.tipo).toBe('COMPRA');
      expect(transacao.valor.toNumber()).toBe(40);
      expect(transacao.taxa.toNumber()).toBe(2);
    });

    it('usa o valor de mercado, não o valor base, como preço', async () => {
      const clube = await clubeComCaixa(300);
      const jogador = await jogadorLivre(40, { condicao: 'MAL_CONDICIONADO' });

      const res = await comprar(jogador, clube);

      expect(res.body.value).toBe(34);
    });
  });

  describe('B11 – compra recusada', () => {
    it('jogador que já tem clube responde 409 e nada muda', async () => {
      const clube = await clubeComCaixa(300);
      const outro = await clubeComCaixa(300, 'Delta FC', 'DFC');
      const jogador = await jogadorLivre(10);
      await prisma.jogador.update({
        where: { id: jogador },
        data: { clubeId: outro },
      });

      const res = await comprar(jogador, clube);

      expect(res.status).toBe(409);
      expect(await clubeDoJogador(jogador)).toBe(outro);
      expect(await caixaDo(clube)).toBe(300);
      expect(await contratos(jogador)).toBe(0);
    });

    it('jogador excluído responde 404 e nada é gravado', async () => {
      const clube = await clubeComCaixa(300);
      const jogador = await jogadorLivre(10);
      await api().delete(`/api/v1/players/${jogador}`);

      const res = await comprar(jogador, clube);

      expect(res.status).toBe(404);
      expect(await caixaDo(clube)).toBe(300);
      expect(await contratos(jogador)).toBe(0);
    });

    it('elenco com 12 jogadores recusa o 13º com 409 e aceita o 12º', async () => {
      const clube = await clubeComCaixa(300);
      const jogadores: number[] = [];
      for (let i = 0; i < 13; i++) {
        jogadores.push(await jogadorLivre(1));
      }
      for (const jogador of jogadores.slice(0, 11)) {
        await prisma.jogador.update({
          where: { id: jogador },
          data: { clubeId: clube },
        });
      }

      const decimoSegundo = await comprar(jogadores[11], clube);
      const decimoTerceiro = await comprar(jogadores[12], clube);

      expect(decimoSegundo.status).toBe(200);
      expect(decimoTerceiro.status).toBe(409);
      expect(await clubeDoJogador(jogadores[12])).toBeNull();
    });

    it.each([
      ['club_id zero', { club_id: 0 }],
      ['club_id negativo', { club_id: -1 }],
      ['club_id como texto', { club_id: '1' }],
      ['club_id fracionário', { club_id: 1.5 }],
      ['club_id ausente', {}],
    ])('%s responde 400 e nada é gravado', async (_, corpo) => {
      const clube = await clubeComCaixa(300);
      const jogador = await jogadorLivre(10);

      const res = await tipar<ErroJson>(
        api()
          .post(`/api/v1/players/${jogador}/buy`)
          .send({ loyalty_until: FIM_PADRAO(), ...corpo }),
      );

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(expect.any(String));
      await expectNadaGravado(jogador, 300, clube);
    });

    it('club_id inexistente responde 404 e nada é gravado', async () => {
      const jogador = await jogadorLivre(10);

      const res = await tipar<ErroJson>(
        api()
          .post(`/api/v1/players/${jogador}/buy`)
          .send({ club_id: 999999, loyalty_until: FIM_PADRAO() }),
      );

      expect(res.status).toBe(404);
      await expectNadaGravado(jogador);
    });
  });

  describe('B12 – fim da fidelidade', () => {
    it.each([
      ['segundos no horário', '2027-03-02T10:15:00-03:00'],
      ['horário UTC', '2027-03-02T10:15Z'],
      ['outro fuso', '2027-03-02T10:15-02:00'],
      ['espaço no lugar do T', '2027-03-02 10:15-03:00'],
      ['sem fuso', '2027-03-02T10:15'],
      ['dia inexistente', '2027-02-30T10:15-03:00'],
      ['hora 24:00', '2027-03-02T24:00-03:00'],
      ['data passada', '2020-01-01T10:00-03:00'],
      ['o próprio momento', paraBrasilia(new Date())],
      ['mais de 1.095 dias', paraBrasilia(emDias(1096))],
    ])('recusa fim da fidelidade com %s (400)', async (_, fim) => {
      const clube = await clubeComCaixa(300);
      const jogador = await jogadorLivre(10);

      const res = await comprar(jogador, clube, fim);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(expect.any(String));
      await expectNadaGravado(jogador, 300, clube);
    });

    it('aceita fim da fidelidade no formato da RN01 e devolve com segundos', async () => {
      const clube = await clubeComCaixa(300);
      const jogador = await jogadorLivre(10);
      const fim = paraBrasilia(emDias(1));

      const res = await comprar(jogador, clube, fim);

      expect(res.status).toBe(200);
      expect(res.body.contract.loyalty_until).toBe(comSegundos(fim));
    });

    it('aceita fim da fidelidade em 1.095 dias', async () => {
      const clube = await clubeComCaixa(300);
      const jogador = await jogadorLivre(10);

      const res = await comprar(jogador, clube, paraBrasilia(emDias(1095)));

      expect(res.status).toBe(200);
    });
  });

  describe('B13 – sequência de compras conferida pela API', () => {
    it('confere valores, caixa, elenco, contratos, valor do elenco e patrimônio', async () => {
      const clube = await clubeComCaixa(300);
      const otto = await jogadorLivre(40, { idade: 20 });
      const lauro = await jogadorLivre(40);
      const teo = await jogadorLivre(40, { condicao: 'DOENTE', agilidade: 30 });
      const davi = await jogadorLivre(40, { condicao: 'MAL_CONDICIONADO' });
      await prisma.jogador.update({
        where: { id: otto },
        data: { posicao: 'ATA' },
      });
      await prisma.jogador.update({
        where: { id: lauro },
        data: { posicao: 'MEI' },
      });
      await prisma.jogador.update({
        where: { id: teo },
        data: { posicao: 'ZAG' },
      });
      await prisma.jogador.update({
        where: { id: davi },
        data: { posicao: 'LAT' },
      });

      const fimOtto = paraBrasilia(emDias(20));
      const fimLauro = paraBrasilia(emDias(120));
      const fimTeo = paraBrasilia(emDias(400));
      const fimDavi = paraBrasilia(emDias(60));

      const c1 = await comprar(otto, clube, fimOtto);
      const c2 = await comprar(lauro, clube, fimLauro);
      const c3 = await comprar(teo, clube, fimTeo);
      const c4 = await comprar(davi, clube, fimDavi);

      expect([c1.body.value, c1.body.fee, c1.body.club_cash]).toEqual([
        44, 2.2, 253.8,
      ]);
      expect([c2.body.value, c2.body.fee, c2.body.club_cash]).toEqual([
        40, 2, 211.8,
      ]);
      expect([c3.body.value, c3.body.fee, c3.body.club_cash]).toEqual([
        24, 0, 187.8,
      ]);
      expect([c4.body.value, c4.body.fee, c4.body.club_cash]).toEqual([
        34, 1.7, 152.1,
      ]);

      const res = await tipar<ClubeDetalheJson>(
        api().get(`/api/v1/clubs/${clube}`),
      );
      const corpo = res.body;

      expect(corpo.cash).toBe(152.1);
      expect(corpo.squad_value).toBe(142);
      expect(corpo.net_worth).toBe(294.1);
      expect(corpo.players.map((j) => j.position)).toEqual([
        'ZAG',
        'LAT',
        'MEI',
        'ATA',
      ]);

      const porId = new Map(corpo.players.map((j) => [j.id, j]));
      const contratoDe = (id: number) => porId.get(id)?.contract;

      expect(contratoDe(teo)).toMatchObject({
        purchase_value: 24,
        loyalty_until: comSegundos(fimTeo),
        remaining_days: 400,
        penalty_rate: 20,
      });
      expect(contratoDe(davi)).toMatchObject({
        purchase_value: 34,
        loyalty_until: comSegundos(fimDavi),
        remaining_days: 60,
        penalty_rate: 10,
      });
      expect(contratoDe(lauro)).toMatchObject({
        purchase_value: 40,
        loyalty_until: comSegundos(fimLauro),
        remaining_days: 120,
        penalty_rate: 10,
      });
      expect(contratoDe(otto)).toMatchObject({
        purchase_value: 44,
        loyalty_until: comSegundos(fimOtto),
        remaining_days: 20,
        penalty_rate: 5,
      });
    });
  });
});
