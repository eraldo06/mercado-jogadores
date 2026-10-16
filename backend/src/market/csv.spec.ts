import { gerarCsv } from './csv';

describe('gerarCsv (RN18)', () => {
  it('gera o exemplo do enunciado, com vírgula decimal e lucro vazio na compra', () => {
    const csv = gerarCsv([
      {
        criadoEm: new Date('2026-11-05T19:40:00Z'),
        tipo: 'VENDA',
        nomeJogador: 'Meia Lua',
        valor: 40,
        taxa: 0.3,
        multa: 4,
        lucro: 3,
        variacaoCaixa: 35.7,
      },
      {
        criadoEm: new Date('2026-11-02T13:15:00Z'),
        tipo: 'COMPRA',
        nomeJogador: 'Meia Lua',
        valor: 37,
        taxa: 1.85,
        multa: 0,
        lucro: null,
        variacaoCaixa: -38.85,
      },
    ]);
    expect(csv).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n' +
        '2026-11-05T16:40:00-03:00;VENDA;Meia Lua;40,00;0,30;4,00;3,00;35,70\n' +
        '2026-11-02T10:15:00-03:00;COMPRA;Meia Lua;37,00;1,85;0,00;;-38,85\n',
    );
  });

  it('põe entre aspas o nome com ponto e vírgula e duplica as aspas internas', () => {
    const csv = gerarCsv([
      {
        criadoEm: new Date('2026-11-02T13:15:00Z'),
        tipo: 'COMPRA',
        nomeJogador: 'Zé "Foguete"; Lima',
        valor: 10,
        taxa: 0,
        multa: 0,
        lucro: null,
        variacaoCaixa: -10,
      },
    ]);
    expect(csv.split('\n')[1]).toContain('"Zé ""Foguete""; Lima"');
  });

  it('gera só o cabeçalho sem transações', () => {
    expect(gerarCsv([])).toBe(
      'data_hora;tipo;jogador;valor;taxa_ou_comissao;multa;lucro;variacao_caixa\n',
    );
  });
});
