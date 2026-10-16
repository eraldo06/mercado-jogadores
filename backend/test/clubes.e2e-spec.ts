import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  apiDe,
  ClubeDetalheJson,
  ClubeJson,
  ErroJson,
  iniciarApp,
  limparBanco,
  tipar,
} from './helpers';

const clubeValido = (extra: Record<string, unknown> = {}) => ({
  name: 'Águias FC',
  acronym: 'AGU',
  ...extra,
});

describe('Clubes (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const api = () => apiDe(app);
  const total = () => prisma.clube.count();
  const criarClube = (corpo: Record<string, unknown>) =>
    tipar<ClubeJson & Partial<ErroJson>>(
      api().post('/api/v1/clubs').send(corpo),
    );

  beforeAll(async () => {
    ({ app, prisma } = await iniciarApp());
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await limparBanco(prisma);
  });

  describe('B09 – criação, unicidade, limite e listagem de clubes', () => {
    it('cria o clube com 201, Location e caixa inicial de 300,00', async () => {
      const res = await api().post('/api/v1/clubs').send(clubeValido());
      const corpo = res.body as ClubeJson;

      expect(res.status).toBe(201);
      expect(res.headers.location).toBe(`/api/v1/clubs/${corpo.id}`);
      expect(corpo).toMatchObject({
        name: 'Águias FC',
        acronym: 'AGU',
        cash: 300,
        squad_value: 0,
        net_worth: 300,
      });
    });

    it.each([
      ['nome com menos de 3 caracteres', 'Ab'],
      ['nome com uma palavra', 'Aguias'],
      ['nome com dígito', 'Aguias 2 FC'],
      ['nome com símbolo', 'Aguias@ FC'],
      ['nome com mais de 5 palavras', 'Aguias Um Dois Tres Quatro Cinco'],
      ['nome com mais de 60 caracteres', 'Ab '.repeat(21)],
      ['nome vazio', ''],
    ])('recusa %s com 400 e não grava', async (_, name) => {
      const res = await criarClube(clubeValido({ name }));

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(expect.any(String));
      expect(await total()).toBe(0);
    });

    it.each([
      ['primeira letra diferente do nome', 'GUA'],
      ['letra que não está no nome', 'AXU'],
      ['letras fora de ordem', 'AUG'],
      ['minúsculas', 'agu'],
      ['com acento', 'ÁGU'],
      ['com duas letras', 'AG'],
      ['com quatro letras', 'AGUI'],
    ])('recusa sigla com %s', async (_, acronym) => {
      const res = await api()
        .post('/api/v1/clubs')
        .send(clubeValido({ acronym }));

      expect(res.status).toBe(400);
      expect(await total()).toBe(0);
    });

    it('recusa sigla com três letras iguais', async () => {
      const res = await api()
        .post('/api/v1/clubs')
        .send({ name: 'Ana Amaral', acronym: 'AAA' });

      expect(res.status).toBe(400);
    });

    it('recusa nome repetido sem diferenciar maiúsculas e espaços (V4)', async () => {
      await api().post('/api/v1/clubs').send(clubeValido());

      const minusculo = await api()
        .post('/api/v1/clubs')
        .send({ name: 'águias fc', acronym: 'AGU' });
      const comEspacos = await api()
        .post('/api/v1/clubs')
        .send({ name: '  Águias   FC ', acronym: 'AGU' });

      expect(minusculo.status).toBe(409);
      expect(comEspacos.status).toBe(409);
      await expect(total()).resolves.toBe(1);
    });

    it('aceita nome igual sem acento, porque acento diferencia (RN10)', async () => {
      await api().post('/api/v1/clubs').send(clubeValido());

      const res = await api()
        .post('/api/v1/clubs')
        .send({ name: 'Aguias FC', acronym: 'AFC' });

      expect(res.status).toBe(201);
      expect(await total()).toBe(2);
    });

    it('recusa sigla já cadastrada com 409', async () => {
      await api().post('/api/v1/clubs').send(clubeValido());

      const res = await criarClube({
        name: 'Atlantico Grande Uniao',
        acronym: 'AGU',
      });

      expect(res.status).toBe(409);
      expect(res.body.message).toEqual(expect.any(String));
      expect(await total()).toBe(1);
    });

    it('aceita o 20º clube e recusa o 21º com 409', async () => {
      const clubes = Array.from({ length: 19 }, (_, i) => ({
        nome: `Clube Teste ${i}`,
        nomeNormalizado: `clube teste ${i}`,
        sigla: `Z${String.fromCharCode(65 + i)}A`,
      }));
      await prisma.clube.createMany({ data: clubes });

      const vigesimo = await api().post('/api/v1/clubs').send(clubeValido());
      const vigesimoPrimeiro = await criarClube({
        name: 'Atlantico Grande Uniao',
        acronym: 'AGU',
      });

      expect(vigesimo.status).toBe(201);
      expect(vigesimoPrimeiro.status).toBe(409);
      expect(vigesimoPrimeiro.body.message).toEqual(expect.any(String));
      expect(await total()).toBe(20);
    });

    it('lista vazia responde 200 com array vazio', async () => {
      const res = await api().get('/api/v1/clubs');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('lista ordenada pelo nome, sem diferenciar acentos, espaço antes de hífen', async () => {
      await api()
        .post('/api/v1/clubs')
        .send({ name: 'Gama SC', acronym: 'GSC' });
      await api()
        .post('/api/v1/clubs')
        .send({ name: 'Épsilon EC', acronym: 'EEC' });
      await api()
        .post('/api/v1/clubs')
        .send({ name: 'Delta FC', acronym: 'DFC' });
      await api()
        .post('/api/v1/clubs')
        .send({ name: 'Ana-Maria FC', acronym: 'AMF' });
      await api()
        .post('/api/v1/clubs')
        .send({ name: 'Ana Lima FC', acronym: 'ALF' });

      const res = await api().get('/api/v1/clubs');
      const nomes = (res.body as ClubeJson[]).map((clube) => clube.name);

      expect(nomes).toEqual([
        'Ana Lima FC',
        'Ana-Maria FC',
        'Delta FC',
        'Épsilon EC',
        'Gama SC',
      ]);
    });

    it('nomes iguais na comparação empatam e são desfeitos pelo id', async () => {
      const primeiro = await api().post('/api/v1/clubs').send(clubeValido());
      const segundo = await api()
        .post('/api/v1/clubs')
        .send({ name: 'Aguias FC', acronym: 'AFC' });

      const res = await api().get('/api/v1/clubs');
      const ids = (res.body as ClubeJson[]).map((clube) => clube.id);

      expect(ids).toEqual([
        (primeiro.body as ClubeJson).id,
        (segundo.body as ClubeJson).id,
      ]);
    });

    it('cada clube da lista traz id, name, acronym, cash, squad_value e net_worth', async () => {
      await api().post('/api/v1/clubs').send(clubeValido());

      const res = await api().get('/api/v1/clubs');

      expect((res.body as ClubeJson[])[0]).toMatchObject({
        name: 'Águias FC',
        acronym: 'AGU',
        cash: 300,
        squad_value: 0,
        net_worth: 300,
      });
    });

    it('consulta do clube sem elenco traz players vazio', async () => {
      const criado = await api().post('/api/v1/clubs').send(clubeValido());
      const id = (criado.body as ClubeJson).id;

      const res = await api().get(`/api/v1/clubs/${id}`);
      const corpo = res.body as ClubeDetalheJson;

      expect(res.status).toBe(200);
      expect(corpo.players).toEqual([]);
      expect(corpo.net_worth).toBe(300);
    });

    it.each(['abc', '0', '-1', '1.5', '01', '2147483648', '999999'])(
      'consulta do clube com id %s responde 404',
      async (id) => {
        const res = await api().get(`/api/v1/clubs/${id}`);

        const corpo = res.body as ErroJson;

        expect(res.status).toBe(404);
        expect(corpo.message).toEqual(expect.any(String));
      },
    );
  });
});
