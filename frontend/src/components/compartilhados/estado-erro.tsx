import { RefreshCw, WifiOff } from 'lucide-react';
import { Button } from '../ui/button';

type PropsEstadoErro = {
  titulo: string;
  descricao?: string;
  aoTentarNovamente?: () => void;
};

export function EstadoErro({
  titulo,
  descricao,
  aoTentarNovamente,
}: PropsEstadoErro) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <WifiOff className="size-5" aria-hidden="true" />
      </span>
      <div className="flex max-w-md flex-col gap-1">
        <p className="font-semibold">{titulo}</p>
        {descricao && (
          <p className="text-sm text-muted-foreground">{descricao}</p>
        )}
      </div>
      {aoTentarNovamente && (
        <Button variante="outline" onClick={aoTentarNovamente}>
          <RefreshCw />
          Tentar de novo
        </Button>
      )}
    </div>
  );
}
