import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type PropsCabecalhoPagina = {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
};

export function CabecalhoPagina({
  icone: Icone,
  titulo,
  descricao,
  acao,
}: PropsCabecalhoPagina) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <span className="flex size-10 items-center justify-center rounded-lg border border-primary-soft bg-primary-soft text-primary">
          <Icone className="size-5" aria-hidden="true" />
        </span>
        <div className="flex flex-col gap-0.5">
          <h1 className="text-2xl leading-8 font-semibold tracking-[-0.025em]">
            {titulo}
          </h1>
          {descricao && (
            <p className="text-sm text-muted-foreground">{descricao}</p>
          )}
        </div>
      </div>
      {acao}
    </header>
  );
}
