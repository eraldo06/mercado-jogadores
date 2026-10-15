const ESPACOS_NAS_PONTAS = /^ +| +$/g;
const ESPACOS_REPETIDOS = / {2,}/g;
const CARACTERE_DE_CONTROLE = /\p{Cc}/u;
const MARCA_DE_ACENTO = /\p{Mn}/gu;
const INTEIRO_POSITIVO = /^[1-9][0-9]*$/;

export const LIMITE_ID = 2147483647;

export function normalizarEspacos(texto: string): string {
  return texto.replace(ESPACOS_NAS_PONTAS, '').replace(ESPACOS_REPETIDOS, ' ');
}

export function possuiControle(texto: string): boolean {
  return CARACTERE_DE_CONTROLE.test(texto);
}

export function contarCaracteres(texto: string): number {
  return [...texto].length;
}

export function contarPalavras(texto: string): number {
  return texto.split(' ').filter((palavra) => /\p{L}/u.test(palavra)).length;
}

export function ignorarAcentos(texto: string): string {
  return texto.normalize('NFD').replace(MARCA_DE_ACENTO, '');
}

export function chaveAlfabetica(texto: string): string {
  return ignorarAcentos(texto.toLowerCase());
}

export function compararNomes(a: string, b: string): number {
  const chaveA = chaveAlfabetica(a);
  const chaveB = chaveAlfabetica(b);
  if (chaveA === chaveB) {
    return 0;
  }
  return chaveA < chaveB ? -1 : 1;
}

export function ehInteiroPositivo(texto: string): boolean {
  return INTEIRO_POSITIVO.test(texto) && Number(texto) <= LIMITE_ID;
}
