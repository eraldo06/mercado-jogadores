import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type PropsEstadoVazio = {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
};

export function EstadoVazio({
  icone: Icone,
  titulo,
  descricao,
  acao,
}: PropsEstadoVazio) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icone className="size-5" aria-hidden="true" />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <p className="font-semibold">{titulo}</p>
        {descricao && (
          <p className="text-sm text-muted-foreground">{descricao}</p>
        )}
      </div>
      {acao}
    </div>
  );
}
