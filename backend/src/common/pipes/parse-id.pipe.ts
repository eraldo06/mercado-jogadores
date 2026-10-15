import { Injectable, NotFoundException, PipeTransform } from '@nestjs/common';
import { ehInteiroPositivo } from '../../domain/texto';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(valor: string): number {
    if (!ehInteiroPositivo(valor)) {
      throw new NotFoundException('Recurso não encontrado');
    }
    return Number(valor);
  }
}
