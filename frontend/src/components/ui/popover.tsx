import * as PopoverPrimitivo from '@radix-ui/react-popover';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Popover(props: ComponentProps<typeof PopoverPrimitivo.Root>) {
  return <PopoverPrimitivo.Root {...props} />;
}

export function PopoverGatilho(
  props: ComponentProps<typeof PopoverPrimitivo.Trigger>,
) {
  return <PopoverPrimitivo.Trigger {...props} />;
}

type PropsPopoverConteudo = {
  children: ReactNode;
  className?: string;
};

export function PopoverConteudo({ children, className }: PropsPopoverConteudo) {
  return (
    <PopoverPrimitivo.Portal>
      <PopoverPrimitivo.Content
        align="start"
        sideOffset={6}
        className={cn(
          'z-50 w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
          className,
        )}
      >
        {children}
      </PopoverPrimitivo.Content>
    </PopoverPrimitivo.Portal>
  );
}
