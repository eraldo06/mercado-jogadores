import { z } from 'zod';
import type { ErrosFormulario } from '../jogadores/validacao-jogador';

const MENSAGEM_NOME =
  'Use de 3 a 60 caracteres, com 2 a 5 palavras; só letras, espaços, hífen e ponto.';
const MENSAGEM_SIGLA = 'Use 3 letras de A a Z, sem acento.';

function normalizarEspacos(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ');
}

function semAcentoEMinusculas(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase();
}

export function letrasNaOrdem(nome: string, sigla: string): boolean {
  const alvo = semAcentoEMinusculas(nome);
  let posicao = 0;
  for (const letra of semAcentoEMinusculas(sigla)) {
    posicao = alvo.indexOf(letra, posicao);
    if (posicao === -1) return false;
    posicao += 1;
  }
  return true;
}

const esquemaClube = z
  .object({
    nome: z
      .string()
      .transform(normalizarEspacos)
      .pipe(
        z
          .string()
          .min(3, { error: MENSAGEM_NOME })
          .max(60, { error: MENSAGEM_NOME })
          .refine(
            (valor) => {
              const palavras = valor.split(' ').length;
              return palavras >= 2 && palavras <= 5;
            },
            { error: MENSAGEM_NOME },
          )
          .refine((valor) => /^[\p{L} .-]+$/u.test(valor), {
            error: MENSAGEM_NOME,
          }),
      ),
    sigla: z
      .string()
      .transform((valor) => valor.trim().toUpperCase())
      .pipe(z.string().regex(/^[A-Z]{3}$/, { error: MENSAGEM_SIGLA })),
  })
  .superRefine((dados, contexto) => {
    if (dados.nome.length === 0) return;
    const primeiraLetra = semAcentoEMinusculas(dados.nome).replace(
      /[^\p{L}]/gu,
      '',
    )[0];
    if (primeiraLetra !== semAcentoEMinusculas(dados.sigla)[0]) {
      contexto.addIssue({
        code: 'custom',
        path: ['sigla'],
        message: 'A primeira letra da sigla é a primeira letra do nome.',
      });
    } else if (!letrasNaOrdem(dados.nome, dados.sigla)) {
      contexto.addIssue({
        code: 'custom',
        path: ['sigla'],
        message: 'As letras da sigla precisam aparecer no nome, nessa ordem.',
      });
    } else if (new Set(dados.sigla).size === 1) {
      contexto.addIssue({
        code: 'custom',
        path: ['sigla'],
        message: 'A sigla não pode ter as três letras iguais.',
      });
    }
  });

export function validarClube(valores: { nome: string; sigla: string }) {
  const resultado = esquemaClube.safeParse(valores);
  if (resultado.success) {
    return { dados: resultado.data, erros: {} as ErrosFormulario };
  }
  const erros: ErrosFormulario = {};
  for (const emitido of resultado.error.issues) {
    const campo = String(emitido.path[0] ?? '');
    erros[campo] ??= emitido.message;
  }
  return { dados: undefined, erros };
}
