import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { ClubsService } from './clubs.service';
import { CreateClubeDto, ListarClubesQuery } from './dto/clube.dto';
import { ClubeDetalhe, ClubeResumo } from './clube-resposta';

@ApiTags('Clubes')
@Controller('clubs')
export class ClubsController {
  constructor(private readonly clubs: ClubsService) {}

  @Get()
  list(@Query() query: ListarClubesQuery): Promise<ClubeResumo[]> {
    return this.clubs.list(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<ClubeDetalhe> {
    return this.clubs.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateClubeDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ClubeResumo> {
    const clube = await this.clubs.create(dto);
    res.location(`${req.path.replace(/\/$/, '')}/${clube.id}`);
    return clube;
  }
}
