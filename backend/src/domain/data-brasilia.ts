const DESLOCAMENTO_BRASILIA_MS = 3 * 60 * 60 * 1000;
const FORMATO_BRASILIA = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;

export function formatarDataBrasilia(data: Date): string {
  const horarioBrasilia = new Date(data.getTime() - DESLOCAMENTO_BRASILIA_MS);
  return `${horarioBrasilia.toISOString().slice(0, 19)}-03:00`;
}

export function interpretarDataBrasilia(texto: string): Date | null {
  const partes = FORMATO_BRASILIA.exec(texto);
  if (!partes) {
    return null;
  }
  const [ano, mes, dia, hora, minuto] = partes.slice(1).map(Number);
  const dataDoDia = new Date(Date.UTC(ano, mes - 1, dia));
  const diaExiste =
    dataDoDia.getUTCMonth() === mes - 1 && dataDoDia.getUTCDate() === dia;
  if (!diaExiste || hora > 23 || minuto > 59) {
    return null;
  }
  return new Date(Date.UTC(ano, mes - 1, dia, hora + 3, minuto));
}
