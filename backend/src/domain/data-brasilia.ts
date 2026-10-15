const DESLOCAMENTO_BRASILIA_MS = 3 * 60 * 60 * 1000;

export function formatarDataBrasilia(data: Date): string {
  const horarioBrasilia = new Date(data.getTime() - DESLOCAMENTO_BRASILIA_MS);
  return `${horarioBrasilia.toISOString().slice(0, 19)}-03:00`;
}
