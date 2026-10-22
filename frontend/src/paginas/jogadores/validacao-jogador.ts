import { z } from 'zod';
import type { Posicao } from '../../api/tipos';

const POSICOES = [
  'GOL',
  'ZAG',
  'LAT',
  'MEI',
  'ATA',
] as const satisfies readonly Posicao[];

export const ATRIBUTOS = [
  'pace',
  'shooting',
  'passing',
  'dribbling',
  'defending',
  'physical',
] as const;

export type ChaveAtributo = (typeof ATRIBUTOS)[number];

export type ValoresFormulario = Record<string, string>;

const MENSAGEM_NOME =
  'Use de 3 a 100 caracteres, com pelo menos duas palavras e sem números.';

function normalizarNome(texto: string): string {
  return texto.trim().replace(/\s+/g, ' ');
}

const nome = z
  .string({ error: MENSAGEM_NOME })
  .transform(normalizarNome)
  .pipe(
    z
      .string({ error: MENSAGEM_NOME })
      .min(3, { error: MENSAGEM_NOME })
      .max(100, { error: MENSAGEM_NOME })
      .refine((valor) => valor.split(' ').length >= 2, { error: MENSAGEM_NOME })
      .refine((valor) => !/\d/.test(valor), { error: MENSAGEM_NOME }),
  );

function inteiroEntre(min: number, max: number, mensagem: string) {
  return z
    .number({ error: mensagem })
    .int({ error: mensagem })
    .min(min, { error: mensagem })
    .max(max, { error: mensagem });
}

const MENSAGEM_IDADE = 'Use uma idade de 16 a 45 anos.';
const MENSAGEM_ATRIBUTO = 'Use um valor de 1 a 99.';

const base = {
  nome,
  posicao: z.enum(POSICOES, { error: 'Escolha uma posição.' }),
  idade: inteiroEntre(16, 45, MENSAGEM_IDADE),
  agilidade: inteiroEntre(1, 100, 'Use um valor de 1 a 100.'),
};

const cadastroSchema = z
  .object({
    ...base,
    pace: inteiroEntre(1, 99, MENSAGEM_ATRIBUTO),
    shooting: inteiroEntre(1, 99, MENSAGEM_ATRIBUTO),
    passing: inteiroEntre(1, 99, MENSAGEM_ATRIBUTO),
    dribbling: inteiroEntre(1, 99, MENSAGEM_ATRIBUTO),
    defending: inteiroEntre(1, 99, MENSAGEM_ATRIBUTO),
    physical: inteiroEntre(1, 99, MENSAGEM_ATRIBUTO),
    potencial: inteiroEntre(1, 99, 'Use um valor de 1 a 99.'),
  })
  .superRefine((dados, contexto) => {
    if (dados.idade >= 35 && dados.agilidade > 85) {
      contexto.addIssue({
        code: 'custom',
        path: ['agilidade'],
        message: 'Com 35 anos ou mais, a agilidade vai até 85.',
      });
    }
    const soma = ATRIBUTOS.reduce((total, chave) => total + dados[chave], 0);
    if (soma > 480) {
      contexto.addIssue({
        code: 'custom',
        path: ['pace'],
        message: 'A soma dos seis atributos não pode passar de 480.',
      });
    }
    const maior = Math.max(...ATRIBUTOS.map((chave) => dados[chave]));
    if (dados.potencial < maior) {
      contexto.addIssue({
        code: 'custom',
        path: ['potencial'],
        message: `Use um valor igual ou maior que o maior atributo (${maior}).`,
      });
    } else if (dados.idade >= 33 && dados.potencial !== maior) {
      contexto.addIssue({
        code: 'custom',
        path: ['potencial'],
        message: `Com 33 anos ou mais, o potencial é igual ao maior atributo (${maior}).`,
      });
    }
  });

export function edicaoSchema(idadeAtual: number) {
  return z
    .object({
      ...base,
      idade: inteiroEntre(
        idadeAtual,
        45,
        `A idade não pode diminuir (atual: ${idadeAtual}).`,
      ),
    })
    .superRefine((dados, contexto) => {
      if (dados.idade >= 35 && dados.agilidade > 85) {
        contexto.addIssue({
          code: 'custom',
          path: ['agilidade'],
          message: 'Com 35 anos ou mais, a agilidade vai até 85.',
        });
      }
    });
}

export type ErrosFormulario = Partial<Record<string, string>>;

function errosDe(emitidos: z.ZodError): ErrosFormulario {
  const erros: ErrosFormulario = {};
  for (const emitido of emitidos.issues) {
    const campo = String(emitido.path[0] ?? '');
    erros[campo] ??= emitido.message;
  }
  return erros;
}

export function numeroDoCampo(texto: string | undefined): number {
  const limpo = (texto ?? '').trim();
  return limpo === '' ? Number.NaN : Number(limpo);
}

export function validarCadastro(valores: ValoresFormulario) {
  const resultado = cadastroSchema.safeParse({
    nome: valores.nome ?? '',
    posicao: valores.posicao,
    idade: numeroDoCampo(valores.idade),
    agilidade: numeroDoCampo(valores.agilidade),
    pace: numeroDoCampo(valores.pace),
    shooting: numeroDoCampo(valores.shooting),
    passing: numeroDoCampo(valores.passing),
    dribbling: numeroDoCampo(valores.dribbling),
    defending: numeroDoCampo(valores.defending),
    physical: numeroDoCampo(valores.physical),
    potencial: numeroDoCampo(valores.potencial),
  });
  return resultado.success
    ? { dados: resultado.data, erros: {} }
    : { dados: undefined, erros: errosDe(resultado.error) };
}

export function validarEdicao(valores: ValoresFormulario, idadeAtual: number) {
  const resultado = edicaoSchema(idadeAtual).safeParse({
    nome: valores.nome ?? '',
    posicao: valores.posicao,
    idade: numeroDoCampo(valores.idade),
    agilidade: numeroDoCampo(valores.agilidade),
  });
  return resultado.success
    ? { dados: resultado.data, erros: {} }
    : { dados: undefined, erros: errosDe(resultado.error) };
}
