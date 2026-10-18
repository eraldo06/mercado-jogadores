import { AlertTriangle, Handshake, Info } from 'lucide-react';
import { ErroApi } from '../../api/cliente';
import type { JogadorDoClube } from '../../api/clubes';
import { AvatarIniciais } from '../../components/compartilhados/avatar-iniciais';
import { BadgeMulta } from '../../components/compartilhados/badge-multa';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { dataHoraBrasilia, inteiro, moeda } from '../../lib/formatar';
import { ROTULO_POSICAO } from '../jogadores/filtros';

type PropsDialogVender = {
  jogador: JogadorDoClube;
  nomeDoClube: string;
  titular: boolean;
  carregando: boolean;
  erroApi: unknown;
  aoFechar: () => void;
  aoConfirmar: () => void;
};

export function DialogVender({
  jogador,
  nomeDoClube,
  titular,
  carregando,
  erroApi,
  aoFechar,
  aoConfirmar,
}: PropsDialogVender) {
  const contrato = jogador.contract;
  const semConexao = Boolean(erroApi) && !(erroApi instanceof ErroApi);
  const erroDaApi = erroApi instanceof ErroApi ? erroApi.message : undefined;

  return (
    <Dialog
      aberto
      largura="lg"
      aoAlterarAbertura={(aberto) => !aberto && aoFechar()}
      titulo={`Vender ${jogador.name}?`}
      descricao={`O jogador sai do elenco do ${nomeDoClube} e volta a ficar livre.`}
      rodape={
        <>
          <Button variante="outline" onClick={aoFechar} disabled={carregando}>
            Cancelar
          </Button>
          <Button
            onClick={aoConfirmar}
            carregando={carregando}
            disabled={carregando}
          >
            {!carregando && !semConexao && <Handshake aria-hidden="true" />}
            {carregando
              ? 'Vendendo…'
              : semConexao
                ? 'Tentar de novo'
                : 'Confirmar venda'}
          </Button>
        </>
      }
    >
      {erroDaApi && (
        <Alert variante="destrutivo" titulo="A venda foi recusada">
          {erroDaApi}
        </Alert>
      )}

      {semConexao && (
        <Alert variante="destrutivo" titulo="Sem conexão">
          A venda não foi confirmada. Verifique a conexão e tente de novo.
        </Alert>
      )}

      {titular && (
        <div className="flex gap-3 rounded-lg border border-warning-soft-border bg-warning-soft p-3 text-warning-soft-foreground">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-0.5 text-sm">
            <span className="font-medium">{jogador.name} é titular</span>
            <span>
              Ao vender, ele sai da escalação, e o {nomeDoClube} só volta a
              jogar partidas depois de escalar de novo os 5 titulares.
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted-subtle p-3">
        <div className="flex items-center gap-3">
          <AvatarIniciais nome={jogador.name} chave={jogador.id} />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{jogador.name}</span>
            <span className="text-xs text-muted-foreground">
              {jogador.position} · {ROTULO_POSICAO[jogador.position]} ·{' '}
              {jogador.age} anos
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground">
            Valor de mercado
          </span>
          <span className="text-lg font-semibold tabular-nums">
            {moeda(jogador.market_value)}
          </span>
        </div>
      </div>

      {contrato && (
        <dl className="divide-y divide-border rounded-lg border border-border text-sm">
          <div className="flex items-center justify-between gap-4 p-3">
            <dt className="text-muted-foreground">Valor de compra</dt>
            <dd className="tabular-nums">{moeda(contrato.purchase_value)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <dt className="text-muted-foreground">Fim da fidelidade</dt>
            <dd className="tabular-nums">
              {dataHoraBrasilia(contrato.loyalty_until).replace(' ', ', ')}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <dt className="text-muted-foreground">Dias restantes</dt>
            <dd className="tabular-nums">{inteiro(contrato.remaining_days)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 p-3">
            <dt className="text-muted-foreground">
              % de multa se vender agora
            </dt>
            <dd>
              <BadgeMulta percentual={contrato.penalty_rate} />
            </dd>
          </div>
        </dl>
      )}

      <div className="flex gap-3 rounded-lg border border-border bg-muted-subtle px-3 py-2 text-xs text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          A venda é pelo valor de mercado do momento. Multa (teto de 10,00),
          lucro, comissão e crédito são calculados ao confirmar.
        </span>
      </div>

      {carregando && (
        <div className="flex gap-3 rounded-lg border border-border bg-muted-subtle px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            Enviando a venda. Os botões ficam desabilitados até a resposta.
          </span>
        </div>
      )}
    </Dialog>
  );
}
