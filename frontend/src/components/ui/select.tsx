import * as SelectPrimitivo from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type OpcaoSelect = {
  valor: string;
  rotulo: string;
};

type PropsSelect = {
  valor: string;
  aoAlterar: (valor: string) => void;
  opcoes: OpcaoSelect[];
  textoTrigger?: ReactNode;
  ariaLabel: string;
  desabilitado?: boolean;
  className?: string;
};

export function Select({
  valor,
  aoAlterar,
  opcoes,
  textoTrigger,
  ariaLabel,
  desabilitado = false,
  className,
}: PropsSelect) {
  return (
    <SelectPrimitivo.Root
      value={valor}
      onValueChange={aoAlterar}
      disabled={desabilitado}
    >
      <SelectPrimitivo.Trigger
        aria-label={ariaLabel}
        className={cn(
          'inline-flex h-9 items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm whitespace-nowrap shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground',
          className,
        )}
      >
        <SelectPrimitivo.Value>{textoTrigger}</SelectPrimitivo.Value>
        <SelectPrimitivo.Icon asChild>
          <ChevronDown
            className="size-4 text-muted-foreground"
            aria-hidden="true"
          />
        </SelectPrimitivo.Icon>
      </SelectPrimitivo.Trigger>
      <SelectPrimitivo.Portal>
        <SelectPrimitivo.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-72 min-w-[--radix-select-trigger-width] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
        >
          <SelectPrimitivo.Viewport className="p-1">
            {opcoes.map((opcao) => (
              <SelectPrimitivo.Item
                key={opcao.valor}
                value={opcao.valor}
                className="relative flex cursor-default items-center rounded-md py-1.5 pr-8 pl-2 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:opacity-50"
              >
                <SelectPrimitivo.ItemText>
                  {opcao.rotulo}
                </SelectPrimitivo.ItemText>
                <SelectPrimitivo.ItemIndicator className="absolute right-2 flex items-center">
                  <Check className="size-4" aria-hidden="true" />
                </SelectPrimitivo.ItemIndicator>
              </SelectPrimitivo.Item>
            ))}
          </SelectPrimitivo.Viewport>
        </SelectPrimitivo.Content>
      </SelectPrimitivo.Portal>
    </SelectPrimitivo.Root>
  );
}
