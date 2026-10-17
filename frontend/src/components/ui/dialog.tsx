import * as DialogPrimitivo from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

type PropsDialog = {
  aberto: boolean;
  aoAlterarAbertura: (aberto: boolean) => void;
  titulo: string;
  descricao?: string;
  rodape?: ReactNode;
  largura?: 'md' | 'lg';
  children?: ReactNode;
};

export function Dialog({
  aberto,
  aoAlterarAbertura,
  titulo,
  descricao,
  rodape,
  largura = 'md',
  children,
}: PropsDialog) {
  return (
    <DialogPrimitivo.Root open={aberto} onOpenChange={aoAlterarAbertura}>
      <DialogPrimitivo.Portal>
        <DialogPrimitivo.Overlay className="fixed inset-0 z-50 bg-overlay" />
        <DialogPrimitivo.Content
          data-slot="dialog"
          className={cn(
            'fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-5 overflow-y-auto rounded-lg border border-border bg-popover p-6 text-popover-foreground shadow-lg outline-none',
            largura === 'md' ? 'max-w-md' : 'max-w-lg',
          )}
        >
          <div className="flex flex-col gap-1.5 pr-8">
            <DialogPrimitivo.Title className="text-lg leading-6 font-semibold">
              {titulo}
            </DialogPrimitivo.Title>
            {descricao && (
              <DialogPrimitivo.Description className="text-sm text-muted-foreground">
                {descricao}
              </DialogPrimitivo.Description>
            )}
          </div>
          <DialogPrimitivo.Close
            aria-label="Fechar"
            className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground opacity-80 outline-none hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <X className="size-4" />
          </DialogPrimitivo.Close>
          {children}
          {rodape && (
            <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
              {rodape}
            </div>
          )}
        </DialogPrimitivo.Content>
      </DialogPrimitivo.Portal>
    </DialogPrimitivo.Root>
  );
}
