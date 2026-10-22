const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function moeda(valor: number): string {
  return formatoMoeda.format(valor);
}

export function moedaComSinal(valor: number): string {
  const sinal = valor > 0 ? '+' : valor < 0 ? '-' : '';
  return `${sinal}${formatoMoeda.format(Math.abs(valor))}`;
}

export function inteiro(valor: number): string {
  return valor.toLocaleString('pt-BR');
}

export function dataHoraBrasilia(iso: string): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(iso);
  if (!partes) {
    return iso;
  }
  const [, ano, mes, dia, hora, minuto] = partes;
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}
