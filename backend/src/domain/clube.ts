import { ignorarAcentos, normalizarEspacos } from './texto';

export const MAXIMO_CLUBES = 20;
export const CAIXA_INICIAL = 300;

export function chaveNomeClube(nome: string): string {
  return normalizarEspacos(nome).toLowerCase();
}

export function erroDeSigla(nome: string, sigla: string): string | null {
  const nomeSemAcento = [...ignorarAcentos(nome.toLowerCase())];
  const letrasDaSigla = [...sigla.toLowerCase()];

  const primeiraLetra = nomeSemAcento.find((letra) => /\p{L}/u.test(letra));
  if (primeiraLetra !== letrasDaSigla[0]) {
    return 'acronym deve começar com a primeira letra do name';
  }

  let posicao = 0;
  for (const letra of nomeSemAcento) {
    if (letra === letrasDaSigla[posicao]) {
      posicao++;
    }
  }
  if (posicao < letrasDaSigla.length) {
    return 'acronym deve ter suas letras, na ordem, dentro do name';
  }

  if (new Set(letrasDaSigla).size === 1) {
    return 'acronym não pode ter as três letras iguais';
  }
  return null;
}
