import { Logger } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

const logger = new Logger('HTTP');

export function registrarRequisicao(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.on('finish', () => {
    logger.log(`${req.method} ${req.path} ${res.statusCode}`);
  });
  next();
}
