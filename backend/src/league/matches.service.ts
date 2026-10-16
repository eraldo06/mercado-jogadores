import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Clube } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { calcularClassificacao } from '../domain/liga/classificacao';
import { Formacao, montarEscalacao } from '../domain/liga/escalacao';
import { Escalacao, simularPartida } from '../domain/liga/placar';
import { CriarPartidaDto, ListarPartidasQuery } from './dto/liga.dto';
import {
  ClassificacaoResposta,
  PartidaDetalhe,
  PartidaResumo,
  toClassificacaoResposta,
  toPartidaDetalhe,
  toPartidaResumo,
} from './liga-resposta';
import { toTitular } from './titular';

const TITULARES = 5;

const INCLUDE_CLUBES = { mandante: true, visitante: true } as const;

@Injectable()
export class MatchesService {
  constructor(private readonly prisma: PrismaService) {}

  async jogar(dto: CriarPartidaDto): Promise<PartidaDetalhe> {
    if (dto.home_club_id === dto.away_club_id) {
      throw new BadRequestException(
        'home_club_id e away_club_id devem ser clubes diferentes',
      );
    }
    const mandante = await this.buscarClube(dto.home_club_id);
    const visitante = await this.buscarClube(dto.away_club_id);
    const ladoMandante = await this.escalacaoCompleta(mandante);
    const ladoVisitante = await this.escalacaoCompleta(visitante);

    const jogo = simularPartida(
      ladoMandante.escalacao,
      ladoVisitante.escalacao,
    );

    const partida = await this.prisma.partida.create({
      data: {
        mandanteId: mandante.id,
        visitanteId: visitante.id,
        golsMandante: jogo.golsMandante,
        golsVisitante: jogo.golsVisitante,
        formacaoMandante: ladoMandante.formacao,
        formacaoVisitante: ladoVisitante.formacao,
        jogadaEm: new Date(),
        duelos: {
          create: jogo.duelos.map((duelo) => ({
            ordem: duelo.ordem,
            clubeAtacanteId:
              duelo.clubeAtacante === 'MANDANTE' ? mandante.id : visitante.id,
            atacanteId: duelo.atacante.id,
            defensorId: duelo.defensor.id,
            nomeAtacante: duelo.atacante.nome,
            nomeDefensor: duelo.defensor.nome,
            posicaoAtacante: duelo.atacante.posicao,
            posicaoDefensor: duelo.defensor.posicao,
            condicaoAtacante: duelo.atacante.condicao,
            condicaoDefensor: duelo.defensor.condicao,
            atributoAtaque: duelo.atributoAtaque,
            atributoDefesa: 'defending',
            valorAtaque: duelo.valorAtaque,
            valorDefesa: duelo.valorDefesa,
            gol: duelo.gol,
          })),
        },
      },
    });

    return this.buscarPartida(partida.id);
  }

  async listar(query: ListarPartidasQuery): Promise<PartidaResumo[]> {
    const clubeId =
      query.club_id === undefined ? undefined : Number(query.club_id);
    if (clubeId !== undefined) {
      await this.buscarClube(clubeId);
    }

    const partidas = await this.prisma.partida.findMany({
      where:
        clubeId === undefined
          ? undefined
          : {
              OR: [{ mandanteId: clubeId }, { visitanteId: clubeId }],
            },
      include: INCLUDE_CLUBES,
      orderBy: [{ jogadaEm: 'desc' }, { id: 'desc' }],
    });
    return partidas.map(toPartidaResumo);
  }

  async buscarPartida(id: number): Promise<PartidaDetalhe> {
    const partida = await this.prisma.partida.findUnique({
      where: { id },
      include: {
        ...INCLUDE_CLUBES,
        duelos: { orderBy: { ordem: 'asc' } },
      },
    });
    if (!partida) {
      throw new NotFoundException('Partida não encontrada');
    }
    return toPartidaDetalhe(partida);
  }

  async classificacao(): Promise<ClassificacaoResposta[]> {
    const [clubes, partidas] = await Promise.all([
      this.prisma.clube.findMany({ select: { id: true, nome: true } }),
      this.prisma.partida.findMany({
        select: {
          mandanteId: true,
          visitanteId: true,
          golsMandante: true,
          golsVisitante: true,
        },
      }),
    ]);
    return calcularClassificacao(clubes, partidas).map(toClassificacaoResposta);
  }

  private async escalacaoCompleta(
    clube: Clube,
  ): Promise<{ escalacao: Escalacao; formacao: Formacao }> {
    const escalacoes = await this.prisma.escalacao.findMany({
      where: { clubeId: clube.id },
      include: { jogador: true },
    });
    if (!clube.formacao || escalacoes.length !== TITULARES) {
      throw new ConflictException(
        `O clube ${clube.nome} não tem a escalação completa`,
      );
    }
    return {
      escalacao: montarEscalacao(escalacoes.map((e) => toTitular(e.jogador))),
      formacao: clube.formacao as Formacao,
    };
  }

  private async buscarClube(id: number): Promise<Clube> {
    const clube = await this.prisma.clube.findUnique({ where: { id } });
    if (!clube) {
      throw new NotFoundException('Clube não encontrado');
    }
    return clube;
  }
}
