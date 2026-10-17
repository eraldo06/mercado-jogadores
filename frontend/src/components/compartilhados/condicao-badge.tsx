import { Badge } from '../ui/badge';

type PropsCondicaoBadge = {
  condicao: 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE';
};

const apresentacao = {
  APTO: { variante: 'sucesso', rotulo: 'Apto' },
  MAL_CONDICIONADO: { variante: 'atencao', rotulo: 'Mal condicionado' },
  DOENTE: { variante: 'destrutivo', rotulo: 'Doente' },
} as const;

export function CondicaoBadge({ condicao }: PropsCondicaoBadge) {
  const { variante, rotulo } = apresentacao[condicao];
  return (
    <Badge variante={variante} ponto>
      {rotulo}
    </Badge>
  );
}
