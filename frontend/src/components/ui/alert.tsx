import { cva, type VariantProps } from 'class-variance-authority';
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/utils';

const alertaVariantes = cva(
  'relative grid w-full grid-cols-[auto_1fr] items-start gap-x-3 rounded-lg border p-3 text-sm',
  {
    variants: {
      variante: {
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
      variante: 'primario',
    },
  },
);

const iconePorVariante: Record<
  NonNullable<VariantProps<typeof alertaVariantes>['variante']>,
  LucideIcon
> = {
  primario: Info,
  sucesso: CircleCheck,
  atencao: TriangleAlert,
  destrutivo: CircleAlert,
};

type PropsAlert = ComponentProps<'div'> &
  VariantProps<typeof alertaVariantes> & {
    titulo?: string;
    children?: ReactNode;
  };

export function Alert({
  className,
  variante = 'primario',
  titulo,
  children,
  ...props
}: PropsAlert) {
  const Icone = iconePorVariante[variante ?? 'primario'];
  return (
    <div
      role={variante === 'destrutivo' ? 'alert' : 'status'}
      data-slot="alert"
      className={cn(alertaVariantes({ variante }), className)}
      {...props}
    >
      <Icone className="mt-0.5 size-4" aria-hidden="true" />
      <div className="flex flex-col gap-0.5">
        {titulo && <p className="font-medium">{titulo}</p>}
        {children && <div className="text-current/90">{children}</div>}
      </div>
    </div>
  );
}
