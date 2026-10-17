import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

const badgeVariantes = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap',
  {
    variants: {
      variante: {
        neutro: 'border-border bg-secondary text-secondary-foreground',
        primario:
          'border-primary-soft bg-primary-soft text-primary-soft-foreground',
        sucesso:
          'border-success-soft-border bg-success-soft text-success-soft-foreground',
        atencao:
          'border-warning-soft-border bg-warning-soft text-warning-soft-foreground',
        destrutivo:
          'border-destructive-soft-border bg-destructive-soft text-destructive-soft-foreground',
      },
    },
    defaultVariants: {
      variante: 'neutro',
    },
  },
);

const corPonto = {
  neutro: 'bg-muted-foreground',
  primario: 'bg-primary',
  sucesso: 'bg-success',
  atencao: 'bg-warning',
  destrutivo: 'bg-destructive',
} as const;

type PropsBadge = ComponentProps<'span'> &
  VariantProps<typeof badgeVariantes> & {
    ponto?: boolean;
  };

export function Badge({
  className,
  variante = 'neutro',
  ponto = false,
  children,
  ...props
}: PropsBadge) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariantes({ variante }), className)}
      {...props}
    >
      {ponto && (
        <span
          aria-hidden="true"
          className={cn(
            'size-1.5 rounded-full',
            corPonto[variante ?? 'neutro'],
          )}
        />
      )}
      {children}
    </span>
  );
}
