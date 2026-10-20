import type { ResultadoPartida } from '../../api/tipos';

export const ROTULO_RESULTADO: Record<ResultadoPartida, string> = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
};

export const ROTULO_ATRIBUTO: Record<string, string> = {
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defending: 'Defesa',
};

export const SIGLA_ATRIBUTO: Record<string, string> = {
  shooting: 'Fin',
  passing: 'Pas',
  dribbling: 'Dri',
  defending: 'Def',
};
