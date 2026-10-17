import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

type PropsCampo = {
  id: string;
  rotulo: string;
  ajuda?: string;
  erro?: string;
  children: ReactNode;
};

export function Campo({ id, rotulo, ajuda, erro, children }: PropsCampo) {
  const idAjuda = `${id}-ajuda`;
  const idErro = `${id}-erro`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {rotulo}
      </label>
      {children}
      {erro ? (
        <p
          id={idErro}
          className="flex items-start gap-1.5 text-xs text-destructive-soft-foreground"
        >
          <CircleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {erro}
        </p>
      ) : (
        ajuda && (
          <p id={idAjuda} className="text-xs text-muted-foreground">
            {ajuda}
          </p>
        )
      )}
    </div>
  );
}
