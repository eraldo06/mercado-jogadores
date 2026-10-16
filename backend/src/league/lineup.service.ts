import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Clube } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ehEscalacaoValida,
  Formacao,
  ordenarElenco,
} from '../domain/liga/escalacao';
import { Posicao } from '../domain/tipos';
import { EscalarDto } from './dto/liga.dto';
import { EscalacaoResposta, toEscalacaoResposta } from './liga-resposta';

@Injectable()
export class LineupService {
  constructor(private readonly prisma: PrismaService) {}

  async obter(clubeId: number): Promise<EscalacaoResposta> {
    const clube = await this.buscarClube(clubeId);
    const escalacoes = await this.prisma.escalacao.findMany({
      where: { clubeId },
      include: { jogador: true },
    });
    const jogadores = ordenarElenco(escalacoes.map((e) => e.jogador));
    return toEscalacaoResposta(
      clube.id,
      clube.formacao as Formacao | null,
      jogadores,
    );
  }

  async escalar(clubeId: number, dto: EscalarDto): Promise<EscalacaoResposta> {
    const clube = await this.buscarClube(clubeId);

    const jogadores = await this.prisma.jogador.findMany({
      where: { id: { in: dto.player_ids }, excluidoEm: null },
    });
    if (jogadores.length !== dto.player_ids.length) {
      throw new NotFoundException('Jogador não encontrado');
    }
    if (jogadores.some((jogador) => jogador.clubeId !== clube.id)) {
      throw new ConflictException('Jogador não está no elenco do clube');
    }
    if (jogadores.some((jogador) => jogador.condicao === 'DOENTE')) {
      throw new ConflictException('Jogador DOENTE não pode ser escalado');
    }
    const posicoes = jogadores.map((jogador) => jogador.posicao as Posicao);
    if (!ehEscalacaoValida(dto.formation, posicoes)) {
      throw new ConflictException(
        'As posições não fecham a formação: 1 GOL e os jogadores de linha de cada setor',
      );
    }

    await this.prisma.$transaction([
      this.prisma.escalacao.deleteMany({ where: { clubeId } }),
      this.prisma.escalacao.createMany({
        data: jogadores.map((jogador) => ({
          clubeId,
          jogadorId: jogador.id,
        })),
      }),
      this.prisma.clube.update({
        where: { id: clubeId },
        data: { formacao: dto.formation },
      }),
    ]);

    return this.obter(clube.id);
  }

  private async buscarClube(id: number): Promise<Clube> {
    const clube = await this.prisma.clube.findUnique({ where: { id } });
    if (!clube) {
      throw new NotFoundException('Clube não encontrado');
    }
    return clube;
  }
}
