import type { ReactNode } from 'react';
import { Button } from '../ui/button';
import { Dialog } from '../ui/dialog';

type PropsConfirmacao = {
  aberto: boolean;
  aoAlterarAbertura: (aberto: boolean) => void;
  titulo: string;
  descricao?: string;
  textoConfirmar: string;
  destrutiva?: boolean;
  carregando?: boolean;
  aoConfirmar: () => void;
  children?: ReactNode;
};

export function ConfirmacaoDialog({
  aberto,
  aoAlterarAbertura,
  titulo,
  descricao,
  textoConfirmar,
  destrutiva = false,
  carregando = false,
  aoConfirmar,
  children,
}: PropsConfirmacao) {
  return (
    <Dialog
      aberto={aberto}
      aoAlterarAbertura={aoAlterarAbertura}
      titulo={titulo}
      descricao={descricao}
      rodape={
        <>
          <Button
            variante="outline"
            onClick={() => aoAlterarAbertura(false)}
            disabled={carregando}
          >
            Cancelar
          </Button>
          <Button
            variante={destrutiva ? 'destrutivo' : 'primary'}
            carregando={carregando}
            onClick={aoConfirmar}
          >
            {textoConfirmar}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
