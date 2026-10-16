import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  apiDe,
  ErroJson,
  iniciarApp,
  JogadorJson,
  limparBanco,
  ListaJogadoresJson,
  nomesDe,
  tipar,
} from './helpers';

type Corpo = Record<string, unknown>;

const jogadorValido = (extra: Corpo = {}): Corpo => ({
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
  ...extra,
});

const atributos = (valor: number): Corpo => ({
  pace: valor,
  shooting: valor,
  passing: valor,
  dribbling: valor,
  defending: valor,
  physical: valor,
});

describe('Jogadores (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const api = () => apiDe(app);
  const criar = (extra?: Corpo) =>
    tipar<JogadorJson>(
      api().post('/api/v1/players').send(jogadorValido(extra)),
    );
  const consultar = (id: number) =>
    tipar<JogadorJson>(api().get(`/api/v1/players/${id}`));
  const listar = (query = '') =>
    tipar<ListaJogadoresJson>(api().get(`/api/v1/players${query}`));
  const total = () => prisma.jogador.count();

  async function criarClube(nome = 'Aguias FC', sigla = 'AGU') {
    return prisma.clube.create({
      data: { nome, nomeNormalizado: nome.toLowerCase(), sigla },
    });
  }

  async function vincular(jogadorId: number, clubeId: number | null) {
    await prisma.jogador.update({
      where: { id: jogadorId },
      data: { clubeId },
    });
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

  describe('B01 – validação do cadastro', () => {
    it.each([
      ['nome vazio', { name: '' }],
      ['nome com uma palavra', { name: 'Joao' }],
      ['nome com dígito', { name: 'Joao 2' }],
      ['nome com tabulação', { name: 'Joao\tSilva' }],
      ['nome com mais de 100 caracteres', { name: 'Ana '.repeat(26) }],
      ['nome ausente', { name: undefined }],
      [
        'nome em outro formato (campo fora do snake_case)',
        { name: undefined, Name: 'Joao Silva' },
      ],
      ['posição em minúsculas', { position: 'mei' }],
      ['posição inexistente', { position: 'PONTA' }],
      ['posição nula', { position: null }],
      ['agilidade zero', { agility: 0 }],
      ['agilidade acima de 100', { agility: 101 }],
      ['agilidade como texto', { agility: '50' }],
      ['agilidade fracionária', { agility: 50.5 }],
      ['idade abaixo de 16', { age: 15 }],
      ['idade acima de 45', { age: 46 }],
      ['velocidade zero', { pace: 0 }],
      ['finalização acima de 99', { shooting: 100 }],
      ['soma dos atributos acima de 480', { ...atributos(90), potential: 90 }],
      ['potencial abaixo do maior atributo', { potential: 59 }],
      ['potencial acima de 99', { potential: 100 }],
      [
        '35 anos com agilidade acima de 85',
        { age: 35, agility: 86, potential: 60 },
      ],
      [
        '33 anos com potencial diferente do maior atributo',
        { age: 33, potential: 70 },
      ],
    ])('recusa %s com 400 e não grava nada', async (_, extra) => {
      const res = await criar(extra);

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(expect.any(String));
      expect(await total()).toBe(0);
    });

    it.each([
      ['array', '[]'],
      ['texto', '"x"'],
      ['número', '10'],
      ['JSON quebrado', '{x'],
    ])('recusa corpo %s com 400', async (_, corpo) => {
      const res = await tipar<ErroJson>(
        api()
          .post('/api/v1/players')
          .set('Content-Type', 'application/json')
          .send(corpo),
      );

      expect(res.status).toBe(400);
      expect(await total()).toBe(0);
    });

    it('aceita 35 anos com agilidade 85 e potencial igual ao maior atributo', async () => {
      const res = await criar({ age: 35, agility: 85, potential: 60 });

      expect(res.status).toBe(201);
    });

    it('normaliza espaços do nome antes de gravar (V4)', async () => {
      const res = await criar({ name: '  Joao   Silva ' });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Joao Silva');
    });
  });

  describe('B02 – códigos de erro e convenções', () => {
    it.each(['abc', '0', '-1', '1.5', '01', '2147483648', '999999'])(
      'id %s na URL responde 404 com message',
      async (id) => {
        const res = await tipar<ErroJson>(api().get(`/api/v1/players/${id}`));

        expect(res.status).toBe(404);
        expect(res.body.message).toEqual(expect.any(String));
      },
    );

    it('rota inexistente responde 404 com message', async () => {
      const res = await tipar<ErroJson>(api().get('/api/v1/inexistente'));

      expect(res.status).toBe(404);
      expect(res.body.message).toEqual(expect.any(String));
    });

    it('respostas JSON trazem Content-Type application/json', async () => {
      const criado = await criar();
      const consulta = await consultar(criado.body.id);
      const naoEncontrado = await consultar(999999);

      expect(criado.headers['content-type']).toMatch(/application\/json/);
      expect(consulta.headers['content-type']).toMatch(/application\/json/);
      expect(naoEncontrado.headers['content-type']).toMatch(
        /application\/json/,
      );
    });

    it('lista vazia responde 200 com data vazia', async () => {
      const res = await listar();

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total_items).toBe(0);
    });
  });

  describe('B03 – campos controlados, 201 com Location e PUT sem mudar indicadores', () => {
    it('ignora campos controlados enviados no corpo (V7)', async () => {
      const res = await criar({
        id: 77,
        base_value: 999,
        overall: 1,
        market_value: 1,
        club_id: 5,
        condition: 'DOENTE',
      });

      expect(res.status).toBe(201);
      expect(res.body.id).not.toBe(77);
      expect(res.body.base_value).toBe(10);
      expect(res.body.market_value).toBe(10);
      expect(res.body.overall).toBe(60);
      expect(res.body.club_id).toBeNull();
      expect(res.body.condition).toBe('APTO');
    });

    it('responde 201 com Location apontando para o recurso criado', async () => {
      const res = await criar();

      expect(res.headers.location).toBe(`/api/v1/players/${res.body.id}`);
    });

    it('consulta por id devolve o mesmo jogador do cadastro', async () => {
      const criado = await criar();
      const res = await consultar(criado.body.id);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(criado.body);
    });

    it('PUT não muda indicadores, potencial nem valor base', async () => {
      const criado = await criar();
      const res = await tipar<JogadorJson>(
        api().put(`/api/v1/players/${criado.body.id}`).send({
          name: 'Ana Lima',
          position: 'MEI',
          agility: 55,
          age: 26,
          pace: 99,
          potential: 99,
          base_value: 999,
        }),
      );

      const depois = await consultar(criado.body.id);
      expect(res.status).toBe(200);
      expect(depois.body.name).toBe('Ana Lima');
      expect(depois.body.pace).toBe(60);
      expect(depois.body.potential).toBe(70);
      expect(depois.body.base_value).toBe(10);
    });
  });

  describe('B04 – edição e alteração de condição', () => {
    it('PUT exige name, position, agility e age', async () => {
      const criado = await criar();
      const res = await tipar<ErroJson>(
        api()
          .put(`/api/v1/players/${criado.body.id}`)
          .send({ name: 'Ana Lima' }),
      );

      expect(res.status).toBe(400);
    });

    it('PUT recusa agilidade fora do limite com 400', async () => {
      const criado = await criar();
      const res = await tipar<ErroJson>(
        api()
          .put(`/api/v1/players/${criado.body.id}`)
          .send({ name: 'Ana Lima', position: 'MEI', agility: 0, age: 25 }),
      );

      expect(res.status).toBe(400);
    });

    it('PUT recusa idade menor que a atual com 409', async () => {
      const criado = await criar({ age: 25 });
      const res = await tipar<ErroJson>(
        api()
          .put(`/api/v1/players/${criado.body.id}`)
          .send({ name: 'Joao Silva', position: 'MEI', agility: 50, age: 24 }),
      );

      expect(res.status).toBe(409);
      expect(res.body.message).toEqual(expect.any(String));
      const depois = await consultar(criado.body.id);
      expect(depois.body.age).toBe(25);
    });

    it('PUT aceita idade maior que a atual', async () => {
      const criado = await criar({ age: 25 });
      const res = await tipar<JogadorJson>(
        api()
          .put(`/api/v1/players/${criado.body.id}`)
          .send({ name: 'Joao Silva', position: 'MEI', agility: 50, age: 26 }),
      );

      expect(res.status).toBe(200);
      expect(res.body.age).toBe(26);
    });

    it('PUT recusa mudança de posição de jogador com clube com 409', async () => {
      const criado = await criar();
      const clube = await criarClube();
      await vincular(criado.body.id, clube.id);

      const res = await tipar<ErroJson>(
        api()
          .put(`/api/v1/players/${criado.body.id}`)
          .send({ name: 'Joao Silva', position: 'ATA', agility: 50, age: 25 }),
      );

      expect(res.status).toBe(409);
    });

    it('PUT aceita manter a posição de jogador com clube', async () => {
      const criado = await criar();
      const clube = await criarClube();
      await vincular(criado.body.id, clube.id);

      const res = await tipar<JogadorJson>(
        api()
          .put(`/api/v1/players/${criado.body.id}`)
          .send({ name: 'Joao Silva', position: 'MEI', agility: 50, age: 25 }),
      );

      expect(res.status).toBe(200);
    });

    it('PATCH de APTO para DOENTE responde 200', async () => {
      const criado = await criar();
      const res = await tipar<JogadorJson>(
        api()
          .patch(`/api/v1/players/${criado.body.id}/condition`)
          .send({ condition: 'DOENTE' }),
      );

      expect(res.status).toBe(200);
      expect(res.body.condition).toBe('DOENTE');
    });

    it('PATCH de DOENTE direto para APTO responde 409', async () => {
      const criado = await criar();
      await api()
        .patch(`/api/v1/players/${criado.body.id}/condition`)
        .send({ condition: 'DOENTE' });

      const res = await tipar<ErroJson>(
        api()
          .patch(`/api/v1/players/${criado.body.id}/condition`)
          .send({ condition: 'APTO' }),
      );

      expect(res.status).toBe(409);
      expect(res.body.message).toEqual(expect.any(String));
    });

    it('PATCH com a condição atual responde 200 sem mudança', async () => {
      const criado = await criar();
      const res = await tipar<JogadorJson>(
        api()
          .patch(`/api/v1/players/${criado.body.id}/condition`)
          .send({ condition: 'APTO' }),
      );

      expect(res.status).toBe(200);
      expect(res.body.condition).toBe('APTO');
    });

    it.each([
      ['condição em minúsculas', { condition: 'ata' }],
      ['condição ausente', {}],
      ['condição nula', { condition: null }],
    ])('PATCH recusa %s com 400', async (_, corpo) => {
      const criado = await criar();
      const res = await tipar<ErroJson>(
        api().patch(`/api/v1/players/${criado.body.id}/condition`).send(corpo),
      );

      expect(res.status).toBe(400);
    });

    it('PATCH ignora o nome enviado (campo de outro endpoint)', async () => {
      const criado = await criar();
      const res = await tipar<JogadorJson>(
        api()
          .patch(`/api/v1/players/${criado.body.id}/condition`)
          .send({ condition: 'MAL_CONDICIONADO', name: 'Outro Nome' }),
      );

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Joao Silva');
    });

    it('PATCH em jogador inexistente responde 404', async () => {
      const res = await tipar<JogadorJson>(
        api()
          .patch('/api/v1/players/999999/condition')
          .send({ condition: 'APTO' }),
      );

      expect(res.status).toBe(404);
    });
  });

  describe('B05 – valor de mercado pela API (RN02 a RN05)', () => {
    it.each([
      [82, 'APTO', 20, 25, 82.0],
      [82, 'APTO', 50, 19, 90.2],
      [82, 'MAL_CONDICIONADO', 50, 25, 69.7],
      [82, 'MAL_CONDICIONADO', 80, 21, 84.05],
      [82, 'MAL_CONDICIONADO', 30, 33, 53.3],
      [82, 'DOENTE', 90, 25, 69.7],
      [82, 'DOENTE', 30, 25, 49.2],
      [82, 'DOENTE', 10, 40, 49.2],
      [9.5, 'MAL_CONDICIONADO', 85, 25, 8.79],
      [1.0, 'MAL_CONDICIONADO', 50, 35, 1.0],
    ] as const)(
      'base %p, %s, agilidade %p, idade %p dá valor de mercado %p',
      async (valorBase, condicao, agilidade, idade, esperado) => {
        const criado = await criar();
        await prisma.jogador.update({
          where: { id: criado.body.id },
          data: { valorBase, condicao, agilidade, idade },
        });

        const res = await consultar(criado.body.id);

        expect(res.body.market_value).toBe(esperado);
      },
    );

    it('base 40,00 de ATA com 75 em todos os atributos muda com idade e condição', async () => {
      const criado = await criar({
        position: 'ATA',
        ...atributos(75),
        potential: 86,
      });
      const id = criado.body.id;
      expect(criado.body.base_value).toBe(40);
      expect(criado.body.overall).toBe(75);
      expect(criado.body.market_value).toBe(40);

      await api()
        .put(`/api/v1/players/${id}`)
        .send({ name: 'Joao Silva', position: 'ATA', agility: 50, age: 32 });
      expect((await consultar(id)).body.market_value).toBe(36);

      await api()
        .patch(`/api/v1/players/${id}/condition`)
        .send({ condition: 'MAL_CONDICIONADO' });
      expect((await consultar(id)).body.market_value).toBe(30);

      await api()
        .put(`/api/v1/players/${id}`)
        .send({ name: 'Joao Silva', position: 'ATA', agility: 30, age: 32 });
      await api()
        .patch(`/api/v1/players/${id}/condition`)
        .send({ condition: 'DOENTE' });
      const doente = await consultar(id);
      expect(doente.body.market_value).toBe(24);
      expect(doente.body.base_value).toBe(40);
    });
  });

  describe('B06 – indicadores, overall e valor base (RN06)', () => {
    it.each([
      ['MEI', [68, 65, 80, 78, 52, 60], 73],
      ['ATA', [78, 75, 73, 82, 48, 68], 76],
      ['LAT', [72, 70, 78, 76, 70, 66], 72],
      ['ZAG', [50, 90, 60, 40, 80, 75], 73],
      ['GOL', [55, 30, 65, 40, 72, 68], 68],
    ])(
      '%s com atributos do enunciado tem overall %i',
      async (posicao, valores, overall) => {
        const [pace, shooting, passing, dribbling, defending, physical] =
          valores;
        const res = await criar({
          position: posicao,
          pace,
          shooting,
          passing,
          dribbling,
          defending,
          physical,
          potential: Math.max(...valores),
        });

        expect(res.status).toBe(201);
        expect(res.body.overall).toBe(overall);
      },
    );

    it('overall 70 com 21 anos e potencial 84 tem valor base 34,20 (jovem promessa)', async () => {
      const res = await criar({
        position: 'ATA',
        ...atributos(70),
        potential: 84,
        age: 21,
      });

      expect(res.body.base_value).toBe(34.2);
    });

    it('overall 70 com 22 anos e potencial 84 tem valor base 30,00', async () => {
      const res = await criar({
        position: 'ATA',
        ...atributos(70),
        potential: 84,
        age: 22,
      });

      expect(res.body.base_value).toBe(30);
    });
  });

  describe('B07 – listagem, busca, filtros, ordenação e paginação (RN07)', () => {
    async function criarQuatro() {
      const ana = await criar({ name: 'Ana Lima', position: 'MEI', age: 20 });
      const bruno = await criar({
        name: 'Bruno Costa',
        position: 'ZAG',
        age: 25,
        agility: 50,
      });
      const carla = await criar({
        name: 'Carla Dias',
        position: 'ATA',
        age: 33,
        potential: 60,
        ...atributos(60),
      });
      const davi = await criar({
        name: 'Davi Reis',
        position: 'MEI',
        age: 40,
        potential: 60,
      });
      await api()
        .patch(`/api/v1/players/${bruno.body.id}/condition`)
        .send({ condition: 'MAL_CONDICIONADO' });
      await api()
        .patch(`/api/v1/players/${davi.body.id}/condition`)
        .send({ condition: 'DOENTE' });
      return {
        ana: ana.body,
        bruno: bruno.body,
        carla: carla.body,
        davi: davi.body,
      };
    }

    const nomes = async (query: string) => {
      const res = await listar(query);
      expect(res.status).toBe(200);
      return nomesDe(res.body);
    };

    it('busca ignora acentos e maiúsculas no nome', async () => {
      await criar({ name: 'João Silva' });
      await criar({ name: 'Meia Lua' });

      expect(await nomes('?search=joao')).toEqual(['João Silva']);
      expect(await nomes('?search=LUA')).toEqual(['Meia Lua']);
    });

    it('filtra por posição, condição, livres e faixa de idade', async () => {
      const dados = await criarQuatro();
      const clube = await criarClube();
      await vincular(dados.davi.id, clube.id);

      expect(await nomes('?position=MEI')).toEqual(['Ana Lima', 'Davi Reis']);
      expect(await nomes('?condition=APTO')).toEqual([
        'Ana Lima',
        'Carla Dias',
      ]);
      expect(await nomes('?free=true')).toEqual([
        'Ana Lima',
        'Bruno Costa',
        'Carla Dias',
      ]);
      expect(await nomes('?free=false')).toEqual(['Davi Reis']);
      expect(await nomes(`?club_id=${clube.id}`)).toEqual(['Davi Reis']);
      expect(await nomes('?min_age=25&max_age=35')).toEqual([
        'Bruno Costa',
        'Carla Dias',
      ]);
      expect(await nomes('?min_age=30')).toEqual(['Carla Dias', 'Davi Reis']);
      expect(await nomes('?max_age=25')).toEqual(['Ana Lima', 'Bruno Costa']);
    });

    it('filtra por faixa de valor de mercado, com um só limite', async () => {
      await criarQuatro();

      expect(await nomes('?min_value=8.5&max_value=9')).toEqual([
        'Bruno Costa',
        'Carla Dias',
      ]);
      expect(await nomes('?min_value=9')).toEqual(['Ana Lima', 'Carla Dias']);
      expect(await nomes('?max_value=8.5')).toEqual([
        'Bruno Costa',
        'Davi Reis',
      ]);
    });

    it('combina filtros: todos valem ao mesmo tempo', async () => {
      await criarQuatro();

      expect(await nomes('?position=MEI&condition=APTO')).toEqual(['Ana Lima']);
      expect(await nomes('?position=MEI&min_value=7')).toEqual(['Ana Lima']);
    });

    it('ordena por valor de mercado e por idade', async () => {
      await criarQuatro();

      expect(await nomes('?sort=value_desc')).toEqual([
        'Ana Lima',
        'Carla Dias',
        'Bruno Costa',
        'Davi Reis',
      ]);
      expect(await nomes('?sort=value_asc')).toEqual([
        'Davi Reis',
        'Bruno Costa',
        'Carla Dias',
        'Ana Lima',
      ]);
      expect(await nomes('?sort=age_asc')).toEqual([
        'Ana Lima',
        'Bruno Costa',
        'Carla Dias',
        'Davi Reis',
      ]);
      expect(await nomes('?sort=age_desc')).toEqual([
        'Davi Reis',
        'Carla Dias',
        'Bruno Costa',
        'Ana Lima',
      ]);
    });

    it('ordena por posição na ordem GOL, ZAG, LAT, MEI, ATA', async () => {
      await criarQuatro();

      expect(await nomes('?sort=position')).toEqual([
        'Bruno Costa',
        'Ana Lima',
        'Davi Reis',
        'Carla Dias',
      ]);
    });

    it('usa o segundo critério para desempatar o primeiro', async () => {
      await criarQuatro();

      expect(await nomes('?sort=position,value_desc')).toEqual([
        'Bruno Costa',
        'Ana Lima',
        'Davi Reis',
        'Carla Dias',
      ]);
    });

    it('pagina depois de filtrar e informa total_items e total_pages', async () => {
      for (let i = 0; i < 23; i++) {
        await criar({ name: `Jogador ${String.fromCharCode(65 + i)}` });
      }

      const primeira = await listar('?limit=10&page=1');
      expect(primeira.body.data).toHaveLength(10);
      expect(primeira.body.meta).toEqual({
        page: 1,
        limit: 10,
        total_items: 23,
        total_pages: 3,
      });

      const ultima = await listar('?limit=10&page=3');
      expect(ultima.body.data).toHaveLength(3);
      expect(ultima.body.meta.total_items).toBe(23);

      const alem = await listar('?limit=10&page=4');
      expect(alem.status).toBe(200);
      expect(alem.body.data).toEqual([]);
      expect(alem.body.meta.total_pages).toBe(3);

      const todas = await listar('?limit=50');
      expect(todas.body.meta.total_pages).toBe(1);
    });

    it('sem jogadores, total_pages é 0', async () => {
      const res = await listar();

      expect(res.body.meta.total_pages).toBe(0);
    });

    it.each([
      ['limit zero', '?limit=0'],
      ['limit acima de 50', '?limit=51'],
      ['page zero', '?page=0'],
      ['page com zero à esquerda', '?page=01'],
      ['sort desconhecido', '?sort=foo'],
      ['sort em maiúsculas', '?sort=POSITION'],
      ['sort com três critérios', '?sort=value_asc,value_desc,age_asc'],
      ['sort repetido', '?sort=name,name'],
      ['position em minúsculas', '?position=mei'],
      ['position vazio', '?position='],
      ['condition inválida', '?condition=ata'],
      ['free em maiúsculas', '?free=TRUE'],
      ['min_age acima de max_age', '?min_age=30&max_age=20'],
      ['idade abaixo de 16', '?min_age=15'],
      ['min_value acima de max_value', '?min_value=10&max_value=5'],
      ['valor com três casas', '?min_value=10.555'],
      ['valor negativo', '?min_value=-1'],
      ['free=true com club_id', '?free=true&club_id=1'],
      ['search com um caractere', '?search=a'],
      ['club_id zero', '?club_id=0'],
      ['parâmetro repetido', '?page=1&page=2'],
    ])('recusa %s com 400', async (_, query) => {
      const res = await tipar<ErroJson>(api().get(`/api/v1/players${query}`));

      expect(res.status).toBe(400);
      expect(res.body.message).toEqual(expect.any(String));
    });

    it('ignora parâmetro fora da tabela', async () => {
      const res = await listar('?foo=bar');

      expect(res.status).toBe(200);
    });

    it('free=false com club_id é aceito', async () => {
      const clube = await criarClube();

      const res = await listar(`?free=false&club_id=${clube.id}`);

      expect(res.status).toBe(200);
    });
  });

  describe('B08 – exclusão lógica de jogador livre (RN09)', () => {
    it('DELETE de jogador livre responde 204 sem corpo', async () => {
      const criado = await criar();
      const res = await tipar<unknown>(
        api().delete(`/api/v1/players/${criado.body.id}`),
      );

      expect(res.status).toBe(204);
      expect(res.text).toBe('');
    });

    it('jogador excluído é 404 na consulta, edição, condição, nova exclusão e compra', async () => {
      const criado = await criar();
      const id = criado.body.id;
      const clube = await criarClube();
      await api().delete(`/api/v1/players/${id}`);

      const consulta = await consultar(id);
      const edicao = await tipar<ErroJson>(
        api()
          .put(`/api/v1/players/${id}`)
          .send({ name: 'Joao Silva', position: 'MEI', agility: 50, age: 25 }),
      );
      const condicao = await tipar<ErroJson>(
        api()
          .patch(`/api/v1/players/${id}/condition`)
          .send({ condition: 'DOENTE' }),
      );
      const novaExclusao = await tipar<ErroJson>(
        api().delete(`/api/v1/players/${id}`),
      );
      const compra = await tipar<ErroJson>(
        api()
          .post(`/api/v1/players/${id}/buy`)
          .send({ club_id: clube.id, loyalty_until: '2027-06-01T00:00-03:00' }),
      );

      expect(consulta.status).toBe(404);
      expect(edicao.status).toBe(404);
      expect(condicao.status).toBe(404);
      expect(novaExclusao.status).toBe(404);
      expect(compra.status).toBe(404);
    });

    it('jogador excluído some de GET /players', async () => {
      const criado = await criar();
      await criar({ name: 'Ana Lima' });
      await api().delete(`/api/v1/players/${criado.body.id}`);

      const res = await listar();

      expect(nomesDe(res.body)).toEqual(['Ana Lima']);
    });

    it('DELETE de jogador com clube responde 409', async () => {
      const criado = await criar();
      const clube = await criarClube();
      await vincular(criado.body.id, clube.id);

      const res = await tipar<ErroJson>(
        api().delete(`/api/v1/players/${criado.body.id}`),
      );

      expect(res.status).toBe(409);
      expect(res.body.message).toEqual(expect.any(String));
      const consulta = await consultar(criado.body.id);
      expect(consulta.status).toBe(200);
    });

    it('DELETE de id inexistente ou fora do formato responde 404', async () => {
      const inexistente = await tipar<ErroJson>(
        api().delete('/api/v1/players/999999'),
      );
      const invalido = await tipar<ErroJson>(
        api().delete('/api/v1/players/abc'),
      );

      expect(inexistente.status).toBe(404);
      expect(invalido.status).toBe(404);
    });
  });
});
