import { CircleCheck } from 'lucide-react';
import type { VendaResposta } from '../../api/mercado';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { moeda, moedaComSinal } from '../../lib/formatar';
import { cn } from '../../lib/utils';

export type ResultadoVenda = {
  resposta: VendaResposta;
  titular: boolean;
};

type PropsResultadoVenda = {
  resultado: ResultadoVenda | null;
  nomeDoClube: string;
  aoFechar: () => void;
};

function descricaoDoResultado(resultado: ResultadoVenda): string {
  const { resposta, titular } = resultado;
  const escalacao = titular ? ' e saiu da escalação' : '';
  const semMulta =
    resposta.remaining_days === 0
      ? ' A fidelidade já tinha terminado, então não houve multa.'
      : '';
  return `${resposta.player_name} voltou a ficar livre${escalacao}.${semMulta}`;
}

export function ResultadoVendaDialog({
  resultado,
  nomeDoClube,
  aoFechar,
}: PropsResultadoVenda) {
  const resposta = resultado?.resposta;
  const comMulta = (resposta?.penalty ?? 0) > 0;
  const lucro = resposta?.profit ?? 0;

  return (
    <Dialog
      aberto={resultado !== null}
      largura="lg"
      icone={
        <span className="flex size-9 items-center justify-center rounded-full bg-success-soft text-success">
          <CircleCheck className="size-5" aria-hidden="true" />
        </span>
      }
      aoAlterarAbertura={(aberto) => !aberto && aoFechar()}
      titulo="Venda concluída"
      descricao={resultado ? descricaoDoResultado(resultado) : undefined}
      rodape={resposta && <Button onClick={aoFechar}>Fechar</Button>}
    >
      {resposta && (
        <dl className="divide-y divide-border rounded-lg border border-border text-sm">
          <div className="flex items-center justify-between gap-4 p-3">
            <dt>Valor de compra</dt>
            <dd className="tabular-nums">{moeda(resposta.purchase_value)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <div className="flex flex-col">
              <dt>Valor de venda</dt>
              <dd className="text-xs text-muted-foreground">
                Valor de mercado no momento da venda
              </dd>
            </div>
            <dd className="tabular-nums">{moeda(resposta.value)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <dt className="text-muted-foreground">Dias restantes</dt>
            <dd className="tabular-nums">{resposta.remaining_days}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <div className="flex flex-col">
              <dt>Multa</dt>
              <dd className="text-xs text-muted-foreground">
                {comMulta
                  ? `${resposta.penalty_rate}% do valor de venda, com teto de 10,00`
                  : 'Fidelidade cumprida: sem multa'}
              </dd>
            </div>
            <dd className="tabular-nums">{moeda(resposta.penalty)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <dt>Lucro</dt>
            <dd
              className={cn(
                'tabular-nums',
                lucro > 0 && 'text-success',
                lucro < 0 && 'text-destructive',
              )}
            >
              {moedaComSinal(lucro)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <div className="flex flex-col">
              <dt>Comissão</dt>
              <dd className="text-xs text-muted-foreground">
                {lucro > 0
                  ? '10% do lucro até 10,00 + 20% do que passar'
                  : 'Sem lucro: sem comissão'}
              </dd>
            </div>
            <dd className="tabular-nums">{moeda(resposta.fee)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 bg-muted-subtle p-3">
            <div className="flex flex-col">
              <dt className="font-semibold">Crédito no caixa</dt>
              <dd className="text-xs text-muted-foreground">
                Valor de venda – multa – comissão
              </dd>
            </div>
            <dd className="text-lg font-semibold tabular-nums">
              {moedaComSinal(resposta.cash_change)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <dt className="text-muted-foreground">Contrato</dt>
            <dd>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium',
                  comMulta
                    ? 'border-warning-soft-border bg-warning-soft text-warning-soft-foreground'
                    : 'border-border bg-muted-subtle text-muted-foreground',
                )}
              >
                <span
                  className="size-1.5 rounded-full bg-current"
                  aria-hidden="true"
                />
                {resposta.contract_status}
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
