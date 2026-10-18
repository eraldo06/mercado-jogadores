import { describe, expect, it } from 'vitest';
import { escalacaoValida } from './validacao-escalacao';

describe('escalação', () => {
  it('é válida com 5 titulares distintos', () => {
    expect(escalacaoValida('2-1-1', [1, 2, 3, 4, 5])).toBe(true);
  });

  it('não é válida com vaga vazia', () => {
    expect(escalacaoValida('2-1-1', [1, 2, null, 4, 5])).toBe(false);
  });

  it('não é válida com o mesmo jogador em duas vagas', () => {
    expect(escalacaoValida('2-1-1', [1, 2, 2, 4, 5])).toBe(false);
  });
});
