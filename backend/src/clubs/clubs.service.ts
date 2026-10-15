import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Clube, Jogador, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CAIXA_INICIAL,
  chaveNomeClube,
  erroDeSigla,
  MAXIMO_CLUBES,
} from '../domain/clube';
import { POSICOES, Posicao } from '../domain/tipos';
import { compararNomes } from '../domain/texto';
import { toJogadorResposta } from '../players/jogador-resposta';
import { CreateClubeDto, ListarClubesQuery } from './dto/clube.dto';
import {
  ClubeDetalhe,
  ClubeResumo,
  JogadorDoClubeResposta,
  toClubeResumo,
  toJogadorDoClube,
} from './clube-resposta';

type ClubeComElenco = Clube & { jogadores: Jogador[] };

@Injectable()
export class ClubsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClubeDto): Promise<ClubeResumo> {
    const erro = erroDeSigla(dto.name, dto.acronym);
    if (erro) {
      throw new BadRequestException(erro);
    }

    const quantidade = await this.prisma.clube.count();
    if (quantidade >= MAXIMO_CLUBES) {
      throw new ConflictException(
        `A liga aceita no máximo ${MAXIMO_CLUBES} clubes`,
      );
    }

    const nomeNormalizado = chaveNomeClube(dto.name);
    const duplicado = await this.prisma.clube.findFirst({
      where: { OR: [{ nomeNormalizado }, { sigla: dto.acronym }] },
    });
    if (duplicado?.nomeNormalizado === nomeNormalizado) {
      throw new ConflictException('Já existe um clube com este nome');
    }
    if (duplicado) {
      throw new ConflictException('Já existe um clube com esta sigla');
    }

    try {
      const criado = await this.prisma.clube.create({
        data: {
          nome: dto.name,
          nomeNormalizado,
          sigla: dto.acronym,
          caixa: CAIXA_INICIAL,
        },
      });
      return toClubeResumo(criado, []);
    } catch (erro) {
      if (
        erro instanceof Prisma.PrismaClientKnownRequestError &&
        erro.code === 'P2002'
      ) {
        throw new ConflictException('Nome ou sigla de clube já cadastrados');
      }
      throw erro;
    }
  }

  async list(query: ListarClubesQuery): Promise<ClubeResumo[]> {
    const clubes = await this.prisma.clube.findMany({
      include: { jogadores: true },
    });
    const resumos = clubes.map((clube) =>
      toClubeResumo(clube, clube.jogadores.map(toJogadorResposta)),
    );

    const ordenacao = query.sort ?? 'name';
    return resumos.sort((a, b) => {
      const porPatrimonio =
        ordenacao === 'net_worth_asc'
          ? a.net_worth - b.net_worth
          : ordenacao === 'net_worth_desc'
            ? b.net_worth - a.net_worth
            : 0;
      return porPatrimonio || compararNomes(a.name, b.name) || a.id - b.id;
    });
  }

  async findOne(id: number): Promise<ClubeDetalhe> {
    const clube = await this.buscarClube(id);
    const momento = new Date();

    const contratos = await this.prisma.contrato.findMany({
      where: {
        clubeId: id,
        situacao: 'ATIVO',
        jogadorId: { in: clube.jogadores.map((jogador) => jogador.id) },
      },
    });
    const contratoPorJogador = new Map(
      contratos.map((contrato) => [contrato.jogadorId, contrato]),
    );

    const elenco = [...clube.jogadores].sort(
      (a, b) =>
        POSICOES.indexOf(a.posicao as Posicao) -
          POSICOES.indexOf(b.posicao as Posicao) ||
        compararNomes(a.nome, b.nome) ||
        a.id - b.id,
    );
    const jogadores: JogadorDoClubeResposta[] = elenco.map((jogador) =>
      toJogadorDoClube(jogador, contratoPorJogador.get(jogador.id), momento),
    );

    return { ...toClubeResumo(clube, jogadores), players: jogadores };
  }

  private async buscarClube(id: number): Promise<ClubeComElenco> {
    const clube = await this.prisma.clube.findUnique({
      where: { id },
      include: { jogadores: true },
    });
    if (!clube) {
      throw new NotFoundException('Clube não encontrado');
    }
    return clube;
  }
}
