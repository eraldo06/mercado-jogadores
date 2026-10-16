import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const parserJson = json();

function pedeCorpo(req: Request): boolean {
  if (req.method === 'GET' || req.method === 'DELETE') {
    return false;
  }
  return !(req.method === 'POST' && req.path.endsWith('/sell'));
}

async function bootstrap() {
  const corsOrigin = process.env.CORS_ORIGIN;
  if (!corsOrigin) {
    throw new Error('Variável de ambiente CORS_ORIGIN não definida');
  }

  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use((req: Request, res: Response, next: NextFunction) =>
    pedeCorpo(req) ? parserJson(req, res, next) : next(),
  );
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: corsOrigin });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Passe API')
    .setDescription('API do mercado de jogadores da liga fictícia Passe')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
