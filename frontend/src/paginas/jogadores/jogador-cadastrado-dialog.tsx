import { CircleCheck } from 'lucide-react';
import type { Jogador } from '../../api/jogadores';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { moeda } from '../../lib/formatar';
import { ROTULO_POSICAO } from './filtros';

type PropsJogadorCadastrado = {
  jogador: Jogador | null;
  aoFechar: () => void;
};

export function JogadorCadastradoDialog({
  jogador,
  aoFechar,
}: PropsJogadorCadastrado) {
  return (
    <Dialog
      aberto={jogador !== null}
      aoAlterarAbertura={(aberto) => !aberto && aoFechar()}
      icone={
        <span className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success">
          <CircleCheck className="size-5" aria-hidden="true" />
        </span>
      }
      titulo="Jogador cadastrado"
      descricao={
        jogador
          ? `${jogador.name} entrou livre e Apto. Valores em moedas, calculados pela API ao salvar.`
          : undefined
      }
      rodape={<Button onClick={aoFechar}>Fechar</Button>}
    >
      {jogador && (
        <dl className="divide-y divide-border rounded-lg border border-border text-sm">
          <div className="flex items-center justify-between gap-4 p-3">
            <div className="flex flex-col">
              <dt className="font-medium">Valor base</dt>
              <dd className="text-xs text-muted-foreground">
                Calculado no cadastro; não muda depois
              </dd>
            </div>
            <dd className="font-semibold tabular-nums">
              {moeda(jogador.base_value)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <div className="flex flex-col">
              <dt className="font-medium">Valor de mercado</dt>
              <dd className="text-xs text-muted-foreground">
                Com condição, agilidade e idade
              </dd>
            </div>
            <dd className="font-semibold tabular-nums">
              {moeda(jogador.market_value)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <div className="flex flex-col">
              <dt className="font-medium">Overall</dt>
              <dd className="text-xs text-muted-foreground">
                Pelos pesos da posição {ROTULO_POSICAO[jogador.position]}
              </dd>
            </div>
            <dd className="font-semibold tabular-nums">{jogador.overall}</dd>
          </div>
        </dl>
      )}
    </Dialog>
  );
}
