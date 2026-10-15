import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      response.status(status).json({ message: this.extractMessage(exception) });
      return;
    }

    this.logger.error(exception);
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ message: 'Erro interno do servidor' });
  }

  private extractMessage(exception: HttpException): string {
    const body = exception.getResponse();

    if (typeof body === 'string') {
      return body;
    }

    const message = (body as { message?: string | string[] }).message;

    if (Array.isArray(message)) {
      return message.join('; ');
    }

    return message ?? exception.message;
  }
}
