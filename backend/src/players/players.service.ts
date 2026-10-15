import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Jogador, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { calcularOverall } from '../domain/mercado/overall';
import { calcularValorBase } from '../domain/mercado/valor-base';
import {
  erroDeIdadeEAgilidade,
  erroDeIndicadores,
} from '../domain/mercado/cadastro-jogador';
import { calcularTotalPaginas, paginar } from '../domain/listagem';
import { POSICOES } from '../domain/tipos';
import { chaveAlfabetica, compararNomes } from '../domain/texto';
import {
  CreateJogadorDto,
  UpdateCondicaoDto,
  UpdateJogadorDto,
} from './dto/jogador.dto';
import { ListarJogadoresQuery } from './dto/listar-jogadores.query';
import { JogadorResposta, toJogadorResposta } from './jogador-resposta';

const IDADE_MINIMA = 16;
const IDADE_MAXIMA = 45;
const VALOR_MINIMO = 0;
const VALOR_MAXIMO = 550;
const LIMITE_PADRAO = 10;
const PAGINA_PADRAO = 1;
const ORDENACAO_PADRAO = 'name';

type Comparador = (a: JogadorResposta, b: JogadorResposta) => number;

const COMPARADORES: Record<string, Comparador> = {
  name: (a, b) => compararNomes(a.name, b.name),
  value_asc: (a, b) => a.market_value - b.market_value,
  value_desc: (a, b) => b.market_value - a.market_value,
  age_asc: (a, b) => a.age - b.age,
  age_desc: (a, b) => b.age - a.age,
  position: (a, b) =>
    POSICOES.indexOf(a.position) - POSICOES.indexOf(b.position),
};

export type ListaJogadores = {
  data: JogadorResposta[];
  meta: {
    page: number;
    limit: number;
    total_items: number;
    total_pages: number;
  };
};

@Injectable()
export class PlayersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateJogadorDto): Promise<JogadorResposta> {
    const erro = erroDeIndicadores(dto);
    if (erro) {
      throw new BadRequestException(erro);
    }

    const atributos = {
      velocidade: dto.pace,
      finalizacao: dto.shooting,
      passe: dto.passing,
      drible: dto.dribbling,
      defesa: dto.defending,
      fisico: dto.physical,
    };
    const overall = calcularOverall(dto.position, atributos);
    const valorBase = calcularValorBase({
      overall,
      potencial: dto.potential,
      idade: dto.age,
    });

    const criado = await this.prisma.jogador.create({
      data: {
        nome: dto.name,
        posicao: dto.position,
        agilidade: dto.agility,
        idade: dto.age,
        valorBase,
        condicao: 'APTO',
        potencial: dto.potential,
        ...atributos,
      },
    });
    return toJogadorResposta(criado);
  }

  async findOne(id: number): Promise<JogadorResposta> {
    return toJogadorResposta(await this.buscarJogador(id));
  }

  async list(query: ListarJogadoresQuery): Promise<ListaJogadores> {
    const pagina = Number(query.page ?? PAGINA_PADRAO);
    const limite = Number(query.limit ?? LIMITE_PADRAO);
    const clubeId =
      query.club_id === undefined ? undefined : Number(query.club_id);
    const faixaIdade = this.faixaDeIdade(query);
    const faixaValor = this.faixaDeValor(query);

    if (query.free === 'true' && clubeId !== undefined) {
      throw new BadRequestException(
        'free=true não pode ser usado junto com club_id',
      );
    }
    if (faixaIdade && faixaIdade.min > faixaIdade.max) {
      throw new BadRequestException('min_age não pode ser maior que max_age');
    }
    if (faixaValor && faixaValor.min > faixaValor.max) {
      throw new BadRequestException(
        'min_value não pode ser maior que max_value',
      );
    }
    if (clubeId !== undefined) {
      await this.garantirClube(clubeId);
    }

    const registros = await this.prisma.jogador.findMany({
      where: this.filtroSql(query, clubeId, faixaIdade),
    });

    const busca = query.search ? chaveAlfabetica(query.search) : undefined;
    const comparadores = this.comparadores(query.sort ?? ORDENACAO_PADRAO);

    const filtrados = registros
      .map(toJogadorResposta)
      .filter(
        (jogador) =>
          !faixaValor ||
          (jogador.market_value >= faixaValor.min &&
            jogador.market_value <= faixaValor.max),
      )
      .filter(
        (jogador) => !busca || chaveAlfabetica(jogador.name).includes(busca),
      )
      .sort((a, b) => {
        for (const comparar of comparadores) {
          const resultado = comparar(a, b);
          if (resultado !== 0) {
            return resultado;
          }
        }
        return 0;
      });

    return {
      data: paginar(filtrados, pagina, limite),
      meta: {
        page: pagina,
        limit: limite,
        total_items: filtrados.length,
        total_pages: calcularTotalPaginas(filtrados.length, limite),
      },
    };
  }

  async update(id: number, dto: UpdateJogadorDto): Promise<JogadorResposta> {
    const jogador = await this.buscarJogador(id);

    const erro = erroDeIdadeEAgilidade(dto.agility, dto.age);
    if (erro) {
      throw new BadRequestException(erro);
    }
    if (jogador.clubeId !== null && dto.position !== jogador.posicao) {
      throw new ConflictException(
        'Jogador com clube não pode mudar de posição',
      );
    }
    if (dto.age < jogador.idade) {
      throw new ConflictException('A idade do jogador não pode diminuir');
    }

    const atualizado = await this.prisma.jogador.update({
      where: { id },
      data: {
        nome: dto.name,
        posicao: dto.position,
        agilidade: dto.agility,
        idade: dto.age,
      },
    });
    return toJogadorResposta(atualizado);
  }

  async updateCondition(
    id: number,
    dto: UpdateCondicaoDto,
  ): Promise<JogadorResposta> {
    const jogador = await this.buscarJogador(id);

    if (jogador.condicao === 'DOENTE' && dto.condition === 'APTO') {
      throw new ConflictException(
        'Jogador DOENTE não pode voltar direto para APTO',
      );
    }

    const atualizado = await this.prisma.jogador.update({
      where: { id },
      data: { condicao: dto.condition },
    });
    return toJogadorResposta(atualizado);
  }

  async remove(id: number): Promise<void> {
    const jogador = await this.buscarJogador(id);

    if (jogador.clubeId !== null) {
      throw new ConflictException(
        'Jogador que está em um clube não pode ser excluído',
      );
    }

    await this.prisma.jogador.update({
      where: { id },
      data: { excluidoEm: new Date() },
    });
  }

  private async buscarJogador(id: number): Promise<Jogador> {
    const jogador = await this.prisma.jogador.findFirst({
      where: { id, excluidoEm: null },
    });
    if (!jogador) {
      throw new NotFoundException('Jogador não encontrado');
    }
    return jogador;
  }

  private async garantirClube(id: number): Promise<void> {
    const clube = await this.prisma.clube.findUnique({ where: { id } });
    if (!clube) {
      throw new NotFoundException('Clube não encontrado');
    }
  }

  private faixaDeIdade(
    query: ListarJogadoresQuery,
  ): { min: number; max: number } | undefined {
    if (query.min_age === undefined && query.max_age === undefined) {
      return undefined;
    }
    return {
      min: Number(query.min_age ?? IDADE_MINIMA),
      max: Number(query.max_age ?? IDADE_MAXIMA),
    };
  }

  private faixaDeValor(
    query: ListarJogadoresQuery,
  ): { min: number; max: number } | undefined {
    if (query.min_value === undefined && query.max_value === undefined) {
      return undefined;
    }
    return {
      min: Number(query.min_value ?? VALOR_MINIMO),
      max: Number(query.max_value ?? VALOR_MAXIMO),
    };
  }

  private filtroSql(
    query: ListarJogadoresQuery,
    clubeId: number | undefined,
    faixaIdade: { min: number; max: number } | undefined,
  ): Prisma.JogadorWhereInput {
    const where: Prisma.JogadorWhereInput = {
      excluidoEm: null,
      posicao: query.position,
      condicao: query.condition,
      idade: faixaIdade
        ? { gte: faixaIdade.min, lte: faixaIdade.max }
        : undefined,
    };

    if (clubeId !== undefined) {
      where.clubeId = clubeId;
    } else if (query.free === 'true') {
      where.clubeId = null;
    } else if (query.free === 'false') {
      where.clubeId = { not: null };
    }
    return where;
  }

  private comparadores(sort: string): Comparador[] {
    const criterios = sort.split(',').map((criterio) => COMPARADORES[criterio]);
    return [
      ...criterios,
      COMPARADORES[ORDENACAO_PADRAO],
      (a, b) => a.id - b.id,
    ];
  }
}
