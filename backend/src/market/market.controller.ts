import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ComprarJogadorDto, ListarTransacoesQuery } from './dto/mercado.dto';
import {
  CompraResposta,
  HistoricoTransacoes,
  MarketService,
  VendaResposta,
} from './market.service';

@ApiTags('Mercado')
@Controller()
export class MarketController {
  constructor(private readonly market: MarketService) {}

  @Post('players/:id/buy')
  @HttpCode(HttpStatus.OK)
  buy(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: ComprarJogadorDto,
  ): Promise<CompraResposta> {
    return this.market.buy(id, dto);
  }

  @Post('players/:id/sell')
  @HttpCode(HttpStatus.OK)
  sell(@Param('id', ParseIdPipe) id: number): Promise<VendaResposta> {
    return this.market.sell(id);
  }

  @Get('clubs/:id/transactions')
  history(
    @Param('id', ParseIdPipe) id: number,
    @Query() query: ListarTransacoesQuery,
  ): Promise<HistoricoTransacoes> {
    return this.market.history(id, query);
  }

  @Get('clubs/:id/transactions/export')
  async exportCsv(
    @Param('id', ParseIdPipe) id: number,
    @Query() query: ListarTransacoesQuery,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const csv = await this.market.exportCsv(id, query);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return csv;
  }
}
