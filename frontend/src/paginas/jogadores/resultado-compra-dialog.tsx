import { ArrowRight, CircleCheck } from 'lucide-react';
import { useNavigate } from 'react-router';
import type { CompraResposta } from '../../api/mercado';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { dataHoraBrasilia, moeda } from '../../lib/formatar';

type PropsResultadoCompra = {
  resposta: CompraResposta | null;
  nomeDoClube: string;
  aoFechar: () => void;
};

export function ResultadoCompraDialog({
  resposta,
  nomeDoClube,
  aoFechar,
}: PropsResultadoCompra) {
  const navegar = useNavigate();

  return (
    <Dialog
      aberto={resposta !== null}
      largura="lg"
      aoAlterarAbertura={(aberto) => !aberto && aoFechar()}
      icone={
        <span className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success">
          <CircleCheck className="size-5" aria-hidden="true" />
        </span>
      }
      titulo="Compra concluída"
      descricao={
        resposta
          ? `${resposta.player_name} agora é do ${nomeDoClube}.`
          : undefined
      }
      rodape={
        resposta && (
          <>
            <Button
              variante="outline"
              onClick={() => {
                aoFechar();
                navegar(`/clubes/${resposta.club_id}`);
              }}
            >
              Ver clube
              <ArrowRight aria-hidden="true" />
            </Button>
            <Button onClick={aoFechar}>Fechar</Button>
          </>
        )
      }
    >
      {resposta && (
        <dl className="divide-y divide-border rounded-lg border border-border text-sm">
          <div className="flex items-center justify-between gap-4 p-3">
            <div className="flex flex-col">
              <dt className="font-normal">Valor</dt>
              <dd className="text-xs text-muted-foreground">
                Valor de mercado no momento da compra
              </dd>
            </div>
            <dd className="font-normal tabular-nums">
              {moeda(resposta.value)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <div className="flex flex-col">
              <dt className="font-normal">Taxa</dt>
              <dd className="text-xs text-muted-foreground">
                {resposta.fee > 0
                  ? '5% do valor, porque passa de 30,00'
                  : 'Sem taxa: o valor não passa de 30,00'}
              </dd>
            </div>
            <dd className="font-normal tabular-nums">{moeda(resposta.fee)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 bg-muted-subtle p-3">
            <div className="flex flex-col">
              <dt className="font-semibold">Custo total</dt>
              <dd className="text-xs text-muted-foreground">Valor + taxa</dd>
            </div>
            <dd className="font-semibold tabular-nums">
              {moeda(resposta.value + resposta.fee)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <dt className="text-muted-foreground">Fim da fidelidade</dt>
            <dd className="text-sm tabular-nums">
              {dataHoraBrasilia(resposta.contract.loyalty_until).replace(
                ' ',
                ', ',
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <dt className="text-muted-foreground">Contrato</dt>
            <dd>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success-soft-border bg-success-soft px-2 py-0.5 text-xs font-medium text-success">
                <span
                  className="size-1.5 rounded-full bg-success"
                  aria-hidden="true"
                />
                {resposta.contract.status}
              </span>
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 bg-muted-subtle p-3">
            <dt className="font-semibold">Novo caixa do {nomeDoClube}</dt>
            <dd className="font-semibold tabular-nums">
              {moeda(resposta.club_cash)}
            </dd>
          </div>
        </dl>
      )}
    </Dialog>
  );
}
