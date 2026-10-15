import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import {
  CreateJogadorDto,
  UpdateCondicaoDto,
  UpdateJogadorDto,
} from './dto/jogador.dto';
import { ListarJogadoresQuery } from './dto/listar-jogadores.query';
import { JogadorResposta } from './jogador-resposta';
import { ListaJogadores, PlayersService } from './players.service';

@ApiTags('Jogadores')
@Controller('players')
export class PlayersController {
  constructor(private readonly players: PlayersService) {}

  @Get()
  list(@Query() query: ListarJogadoresQuery): Promise<ListaJogadores> {
    return this.players.list(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<JogadorResposta> {
    return this.players.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateJogadorDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<JogadorResposta> {
    const jogador = await this.players.create(dto);
    res.location(`${req.path.replace(/\/$/, '')}/${jogador.id}`);
    return jogador;
  }

  @Put(':id')
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateJogadorDto,
  ): Promise<JogadorResposta> {
    return this.players.update(id, dto);
  }

  @Patch(':id/condition')
  updateCondition(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateCondicaoDto,
  ): Promise<JogadorResposta> {
    return this.players.updateCondition(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.players.remove(id);
  }
}
