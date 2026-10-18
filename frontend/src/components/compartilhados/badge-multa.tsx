import { Badge } from '../ui/badge';

export function BadgeMulta({ percentual }: { percentual: number }) {
  if (percentual === 0) {
    return <Badge variante="sucesso">✓ 0%</Badge>;
  }
  if (percentual >= 20) {
    return <Badge variante="destrutivo">{percentual}%</Badge>;
  }
  return <Badge variante="atencao">{percentual}%</Badge>;
}
