import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type PropsCabecalhoPagina = {
  icone?: LucideIcon;
  marca?: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
};

export function CabecalhoPagina({
  icone: Icone,
  marca,
  titulo,
  descricao,
  acao,
}: PropsCabecalhoPagina) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {marca ?? (
          <span className="flex size-12 items-center justify-center rounded-xl border border-primary bg-primary-soft text-primary">
            {Icone && <Icone className="size-[22px]" aria-hidden="true" />}
          </span>
        )}
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
