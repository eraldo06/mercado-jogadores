import { INestApplication, ValidationPipe } from '@nestjs/common';
import { json } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { registrarRequisicao } from './common/logs/registro-requisicoes.middleware';

const parserJson = json();

function pedeCorpo(req: Request): boolean {
  if (req.method === 'GET' || req.method === 'DELETE') {
    return false;
  }
  return !(req.method === 'POST' && req.path.endsWith('/sell'));
}

export function configurarApp(app: INestApplication, corsOrigin: string): void {
  app.use(registrarRequisicao);
  app.use((req: Request, res: Response, next: NextFunction) =>
    pedeCorpo(req) ? parserJson(req, res, next) : next(),
  );
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: corsOrigin });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
}
