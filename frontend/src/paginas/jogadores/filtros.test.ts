import { describe, expect, it } from 'vitest';
import { lerEstado, legendaJogadores } from './filtros';

describe('legenda da lista de jogadores', () => {
  it('sem filtro, explica o cálculo e a busca', () => {
    expect(legendaJogadores(lerEstado(new URLSearchParams()))).toEqual([
      'Overall e valor de mercado são calculados a cada consulta. A busca ignora maiúsculas, minúsculas e acentos.',
    ]);
  });

  it('com busca, mostra o exemplo do primeiro resultado', () => {
    const estado = lerEstado(new URLSearchParams('busca=joao'));
    expect(legendaJogadores(estado, 'João Silva')).toEqual([
      '“joao” encontra “João Silva”: a busca procura o texto dentro do nome, sem diferenciar maiúsculas, minúsculas e acentos.',
    ]);
  });

  it('com filtros, explica a combinação e a faixa de valor', () => {
    const estado = lerEstado(
      new URLSearchParams(
        'condicao=MAL_CONDICIONADO&valor_min=10&valor_max=60',
      ),
    );
    expect(legendaJogadores(estado)).toEqual([
      'Os filtros se combinam: a lista mostra só quem atende a todos. A faixa de valor usa o valor de mercado, nunca o valor base.',
    ]);
  });

  it('na aba Livres, avisa que o filtro por clube fica desabilitado', () => {
    const estado = lerEstado(new URLSearchParams('aba=livres'));
    expect(legendaJogadores(estado)).toEqual([
      'Com a aba “Livres” ativa, o filtro por clube fica desabilitado, porque essa combinação não é aceita.',
    ]);
  });
});
