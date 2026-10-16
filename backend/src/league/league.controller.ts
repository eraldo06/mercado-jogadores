import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { LineupService } from './lineup.service';
import { MatchesService } from './matches.service';
import {
  CriarPartidaDto,
  EscalarDto,
  ListarPartidasQuery,
} from './dto/liga.dto';
import {
  ClassificacaoResposta,
  EscalacaoResposta,
  PartidaDetalhe,
  PartidaResumo,
} from './liga-resposta';

@ApiTags('Liga')
@Controller()
export class LeagueController {
  constructor(
    private readonly lineup: LineupService,
    private readonly matches: MatchesService,
  ) {}

  @Get('clubs/:id/lineup')
  getLineup(@Param('id', ParseIdPipe) id: number): Promise<EscalacaoResposta> {
    return this.lineup.obter(id);
  }

  @Put('clubs/:id/lineup')
  @HttpCode(HttpStatus.OK)
  setLineup(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: EscalarDto,
  ): Promise<EscalacaoResposta> {
    return this.lineup.escalar(id, dto);
  }

  @Post('matches')
  @HttpCode(HttpStatus.CREATED)
  async playMatch(
    @Body() dto: CriarPartidaDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PartidaDetalhe> {
    const partida = await this.matches.jogar(dto);
    res.location(`${req.path.replace(/\/$/, '')}/${partida.id}`);
    return partida;
  }

  @Get('matches')
  listMatches(@Query() query: ListarPartidasQuery): Promise<PartidaResumo[]> {
    return this.matches.listar(query);
  }

  @Get('matches/:id')
  findMatch(@Param('id', ParseIdPipe) id: number): Promise<PartidaDetalhe> {
    return this.matches.buscarPartida(id);
  }

  @Get('standings')
  standings(): Promise<ClassificacaoResposta[]> {
    return this.matches.classificacao();
  }
}
