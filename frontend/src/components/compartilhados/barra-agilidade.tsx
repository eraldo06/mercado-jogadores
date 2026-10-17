import { cn } from '../../lib/utils';

type PropsBarraAgilidade = {
  valor: number;
};

function corDaBarra(valor: number): string {
  if (valor < 31) return 'bg-chart-negative';
  if (valor >= 80) return 'bg-chart-positive';
  return 'bg-muted-foreground';
}

export function BarraAgilidade({ valor }: PropsBarraAgilidade) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-right tabular-nums">{valor}</span>
      <span
        className="h-1.5 w-16 overflow-hidden rounded-full bg-muted"
        aria-hidden="true"
      >
        <span
          className={cn('block h-full rounded-full', corDaBarra(valor))}
          style={{ width: `${valor}%` }}
        />
      </span>
    </div>
  );
}
