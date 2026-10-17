import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/utils';

const botaoVariantes = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap shadow-xs transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variante: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
        outline:
          'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'shadow-none hover:bg-accent hover:text-accent-foreground',
        destrutivo:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      tamanho: {
        padrao: 'h-9 px-4',
        sm: 'h-8 px-3',
        lg: 'h-10 px-6',
        icone: 'size-9',
      },
    },
    defaultVariants: {
      variante: 'primary',
      tamanho: 'padrao',
    },
  },
);

type PropsBotao = ComponentProps<'button'> &
  VariantProps<typeof botaoVariantes> & {
    asChild?: boolean;
    carregando?: boolean;
  };

export function Button({
  className,
  variante,
  tamanho,
  asChild = false,
  carregando = false,
  disabled,
  children,
  ...props
}: PropsBotao) {
  const Componente = asChild ? Slot : 'button';
  return (
    <Componente
      data-slot="button"
      className={cn(botaoVariantes({ variante, tamanho }), className)}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      {...props}
    >
      {carregando && <LoaderCircle className="animate-spin" />}
      {children}
    </Componente>
  );
}
