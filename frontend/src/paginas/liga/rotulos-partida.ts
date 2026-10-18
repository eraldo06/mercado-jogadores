import type { ResultadoPartida } from '../../api/tipos';

export const ROTULO_RESULTADO: Record<ResultadoPartida, string> = {
  MANDANTE: 'Vitória do mandante',
  VISITANTE: 'Vitória do visitante',
  EMPATE: 'Empate',
};
