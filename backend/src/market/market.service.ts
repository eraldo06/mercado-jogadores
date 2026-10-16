import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Clube, Jogador, Transacao } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  formatarDataBrasilia,
  interpretarDataBrasilia,
} from '../domain/data-brasilia';
import { calcularValorMercado } from '../domain/mercado/valor-mercado';
import {
  calcularCustoTotalCompra,
  calcularTaxaCompra,
  excedeLimiteDeCaixa,
} from '../domain/mercado/compra';
import { calcularVenda } from '../domain/mercado/venda';
import { calcularDiasRestantes } from '../domain/mercado/multa';
import { calcularResumo } from '../domain/mercado/resumo';
import { Condicao } from '../domain/tipos';
import { ComprarJogadorDto, ListarTransacoesQuery } from './dto/mercado.dto';
import { toTransacaoResposta, TransacaoResposta } from './transacao-resposta';
import { gerarCsv } from './csv';

const MILISSEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;
const MAXIMO_DIAS_FIDELIDADE = 1095;
const MAXIMO_ELENCO = 12;

export type CompraResposta = {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: 'COMPRA';
  value: number;
  fee: number;
  penalty: number;
  profit: null;
  cash_change: number;
  created_at: string;
  contract: { purchase_value: number; loyalty_until: string; status: 'ATIVO' };
  club_cash: number;
};

export type VendaResposta = TransacaoResposta & {
  type: 'VENDA';
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: 'RESCINDIDO' | 'ENCERRADO';
  club_cash: number;
};

export type HistoricoTransacoes = {
  data: TransacaoResposta[];
  summary: ReturnType<typeof calcularResumo>;
};

@Injectable()
export class MarketService {
  constructor(private readonly prisma: PrismaService) {}

  async buy(
    jogadorId: number,
    dto: ComprarJogadorDto,
  ): Promise<CompraResposta> {
    const momento = new Date();
    const fim = interpretarDataBrasilia(dto.loyalty_until);
    if (!fim || fim.getTime() <= momento.getTime()) {
      throw new BadRequestException(
        'loyalty_until deve ser depois do momento da compra',
      );
    }
    if (
      fim.getTime() - momento.getTime() >
      MAXIMO_DIAS_FIDELIDADE * MILISSEGUNDOS_POR_DIA
    ) {
      throw new BadRequestException(
        `loyalty_until deve ser no máximo ${MAXIMO_DIAS_FIDELIDADE} dias depois da compra`,
      );
    }

    const jogador = await this.buscarJogadorAtivo(jogadorId);
    const clube = await this.buscarClube(dto.club_id);

    if (jogador.clubeId !== null) {
      throw new ConflictException('Jogador não está livre');
    }
    const vendeuAntes = await this.prisma.transacao.findFirst({
      where: { clubeId: clube.id, jogadorId, tipo: 'VENDA' },
    });
    if (vendeuAntes) {
      throw new ConflictException(
        'O clube não pode comprar um jogador que ele mesmo vendeu',
      );
    }
    const tamanhoElenco = await this.prisma.jogador.count({
      where: { clubeId: clube.id },
    });
    if (tamanhoElenco >= MAXIMO_ELENCO) {
      throw new ConflictException(
        `O elenco aceita no máximo ${MAXIMO_ELENCO} jogadores`,
      );
    }

    const valor = this.valorDeMercado(jogador);
    const taxa = calcularTaxaCompra(valor);
    const custo = calcularCustoTotalCompra(valor);
    if (excedeLimiteDeCaixa(custo, clube.caixa.toNumber())) {
      throw new ConflictException(
        'O custo da compra passa de 50% do caixa do clube',
      );
    }

    const { transacao, caixa } = await this.prisma.$transaction(async (tx) => {
      const travado = await tx.jogador.updateMany({
        where: { id: jogadorId, clubeId: null, excluidoEm: null },
        data: { clubeId: clube.id },
      });
      if (travado.count === 0) {
        throw new ConflictException('Jogador não está livre');
      }

      const caixaAtualizado = await tx.clube.updateMany({
        where: { id: clube.id, caixa: { gte: custo } },
        data: { caixa: { decrement: custo } },
      });
      if (caixaAtualizado.count === 0) {
        throw new ConflictException(
          'O caixa do clube não cobre o custo da compra',
        );
      }

      await tx.contrato.create({
        data: {
          jogadorId,
          clubeId: clube.id,
          valorCompra: valor,
          fidelidadeAte: fim,
          situacao: 'ATIVO',
          iniciadoEm: momento,
        },
      });
      const registrada = await tx.transacao.create({
        data: {
          clubeId: clube.id,
          jogadorId,
          nomeJogador: jogador.nome,
          tipo: 'COMPRA',
          valor,
          taxa,
          multa: 0,
          lucro: null,
          variacaoCaixa: -custo,
          criadoEm: momento,
        },
      });
      const clubeDepois = await tx.clube.findUniqueOrThrow({
        where: { id: clube.id },
      });
      return { transacao: registrada, caixa: clubeDepois.caixa.toNumber() };
    });

    return {
      id: transacao.id,
      club_id: clube.id,
      player_id: jogadorId,
      player_name: jogador.nome,
      type: 'COMPRA',
      value: valor,
      fee: taxa,
      penalty: 0,
      profit: null,
      cash_change: -custo,
      created_at: formatarDataBrasilia(transacao.criadoEm),
      contract: {
        purchase_value: valor,
        loyalty_until: formatarDataBrasilia(fim),
        status: 'ATIVO',
      },
      club_cash: caixa,
    };
  }

  async sell(jogadorId: number): Promise<VendaResposta> {
    const momento = new Date();
    const jogador = await this.buscarJogadorAtivo(jogadorId);
    if (jogador.clubeId === null) {
      throw new ConflictException('Jogador livre não pode ser vendido');
    }
    const clubeId = jogador.clubeId;

    const contrato = await this.prisma.contrato.findFirst({
      where: { jogadorId, clubeId, situacao: 'ATIVO' },
    });
    if (!contrato) {
      throw new ConflictException('Jogador não tem contrato ativo no clube');
    }

    const valor = this.valorDeMercado(jogador);
    const dias = calcularDiasRestantes(contrato.fidelidadeAte, momento);
    const venda = calcularVenda({
      valorCompra: contrato.valorCompra.toNumber(),
      valorMercado: valor,
      diasRestantes: dias,
    });

    const { transacao, caixa } = await this.prisma.$transaction(async (tx) => {
      const travado = await tx.jogador.updateMany({
        where: { id: jogadorId, clubeId, excluidoEm: null },
        data: { clubeId: null },
      });
      if (travado.count === 0) {
        throw new ConflictException('Jogador já não está no clube');
      }

      await tx.escalacao.deleteMany({ where: { jogadorId } });
      await tx.contrato.update({
        where: { id: contrato.id },
        data: { situacao: venda.situacao, encerradoEm: momento },
      });
      const clubeDepois = await tx.clube.update({
        where: { id: clubeId },
        data: { caixa: { increment: venda.credito } },
      });
      const registrada = await tx.transacao.create({
        data: {
          clubeId,
          jogadorId,
          nomeJogador: jogador.nome,
          tipo: 'VENDA',
          valor,
          taxa: venda.comissao,
          multa: venda.multa,
          lucro: venda.lucro,
          variacaoCaixa: venda.credito,
          criadoEm: momento,
        },
      });
      return { transacao: registrada, caixa: clubeDepois.caixa.toNumber() };
    });

    return {
      ...toTransacaoResposta(transacao),
      type: 'VENDA',
      fee: venda.comissao,
      penalty: venda.multa,
      profit: venda.lucro,
      cash_change: venda.credito,
      purchase_value: contrato.valorCompra.toNumber(),
      remaining_days: dias,
      penalty_rate: venda.percentualMulta,
      contract_status: venda.situacao,
      club_cash: caixa,
    };
  }

  async history(
    clubeId: number,
    query: ListarTransacoesQuery,
  ): Promise<HistoricoTransacoes> {
    const transacoes = await this.filtrar(clubeId, query);
    return {
      data: transacoes.map(toTransacaoResposta),
      summary: calcularResumo(
        transacoes.map((t) => ({
          tipo: t.tipo as 'COMPRA' | 'VENDA',
          valor: t.valor.toNumber(),
          taxa: t.taxa.toNumber(),
          multa: t.multa.toNumber(),
          lucro: t.lucro?.toNumber() ?? null,
          variacaoCaixa: t.variacaoCaixa.toNumber(),
        })),
      ),
    };
  }

  async exportCsv(
    clubeId: number,
    query: ListarTransacoesQuery,
  ): Promise<string> {
    const transacoes = await this.filtrar(clubeId, query);
    return gerarCsv(
      transacoes.map((t) => ({
        criadoEm: t.criadoEm,
        tipo: t.tipo,
        nomeJogador: t.nomeJogador,
        valor: t.valor.toNumber(),
        taxa: t.taxa.toNumber(),
        multa: t.multa.toNumber(),
        lucro: t.lucro?.toNumber() ?? null,
        variacaoCaixa: t.variacaoCaixa.toNumber(),
      })),
    );
  }

  private async filtrar(
    clubeId: number,
    query: ListarTransacoesQuery,
  ): Promise<Transacao[]> {
    await this.buscarClube(clubeId);

    const jogadorId =
      query.player_id === undefined ? undefined : Number(query.player_id);
    if (jogadorId !== undefined) {
      await this.buscarJogadorAtivo(jogadorId);
    }
    const tipos = query.type?.split(',');

    return this.prisma.transacao.findMany({
      where: {
        clubeId,
        jogadorId,
        tipo: tipos ? { in: tipos } : undefined,
      },
      orderBy: [{ criadoEm: 'desc' }, { id: 'desc' }],
    });
  }

  private valorDeMercado(jogador: Jogador): number {
    return calcularValorMercado({
      valorBase: jogador.valorBase.toNumber(),
      condicao: jogador.condicao as Condicao,
      agilidade: jogador.agilidade,
      idade: jogador.idade,
    });
  }

  private async buscarJogadorAtivo(id: number): Promise<Jogador> {
    const jogador = await this.prisma.jogador.findFirst({
      where: { id, excluidoEm: null },
    });
    if (!jogador) {
      throw new NotFoundException('Jogador não encontrado');
    }
    return jogador;
  }

  private async buscarClube(id: number): Promise<Clube> {
    const clube = await this.prisma.clube.findUnique({ where: { id } });
    if (!clube) {
      throw new NotFoundException('Clube não encontrado');
    }
    return clube;
  }
}
