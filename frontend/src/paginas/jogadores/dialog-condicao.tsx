import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { ErroApi } from '../../api/cliente';
import type { Jogador } from '../../api/jogadores';
import type { Condicao } from '../../api/tipos';
import { Alert } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { cn } from '../../lib/utils';
import { CondicaoBadge } from '../../components/compartilhados/condicao-badge';
import { ROTULO_CONDICAO } from './filtros';

const OPCOES: { valor: Condicao; descricao: string }[] = [
  { valor: 'APTO', descricao: 'Sem desconto por condição.' },
  {
    valor: 'MAL_CONDICIONADO',
    descricao:
      'Desconto de 15%. Agilidade de 80 a 100 corta pela metade; de 1 a 30 soma 10 pontos.',
  },
  {
    valor: 'DOENTE',
    descricao: 'Desconto de 30%, com o mesmo ajuste de agilidade.',
  },
];

type PropsDialogCondicao = {
  aberto: boolean;
  aoFechar: () => void;
  jogador: Jogador;
  nomeDoClube?: string;
  titular: boolean;
  carregando: boolean;
  erroApi: unknown;
  aoSalvar: (condicao: Condicao) => void;
};

export function DialogCondicao(props: PropsDialogCondicao) {
  const { jogador } = props;
  const [selecionada, setSelecionada] = useState<Condicao>(jogador.condition);
  const mudaParaDoente =
    props.titular && selecionada === 'DOENTE' && jogador.condition !== 'DOENTE';
  const erroDaApi =
    props.erroApi instanceof ErroApi
      ? props.erroApi.message
      : props.erroApi
        ? 'Não foi possível alterar a condição.'
        : undefined;

  return (
    <Dialog
      aberto={props.aberto}
      aoAlterarAbertura={(aberto) => !aberto && props.aoFechar()}
      titulo="Alterar condição física"
      descricao="A condição muda o desconto do valor de mercado, recalculado ao salvar."
      rodape={
        <>
          <Button
            variante="outline"
            onClick={props.aoFechar}
            disabled={props.carregando}
          >
            Cancelar
          </Button>
          <Button
            carregando={props.carregando}
            onClick={() => props.aoSalvar(selecionada)}
          >
            Salvar condição
          </Button>
        </>
      }
    >
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted-subtle p-3">
        <div className="flex flex-col">
          <span className="font-medium">{jogador.name}</span>
          <span className="text-xs text-muted-foreground">
            {jogador.position} · {jogador.age} anos
          </span>
        </div>
        <CondicaoBadge condicao={jogador.condition} />
      </div>

      <div
        role="radiogroup"
        aria-label="Condição física"
        className="flex flex-col gap-2"
      >
        {OPCOES.map((opcao) => {
          const atual = opcao.valor === jogador.condition;
          const bloqueada =
            opcao.valor === 'APTO' && jogador.condition === 'DOENTE';
          const marcada = selecionada === opcao.valor;
          return (
            <label
              key={opcao.valor}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                marcada ? 'border-primary bg-primary-soft' : 'border-border',
                bloqueada && 'cursor-not-allowed opacity-60',
              )}
            >
              <input
                type="radio"
                name="condicao"
                value={opcao.valor}
                checked={marcada}
                disabled={bloqueada}
                onChange={() => setSelecionada(opcao.valor)}
                className="mt-1 accent-primary"
              />
              <span className="flex flex-col gap-0.5">
                <span className="flex items-center gap-2 font-medium">
                  {ROTULO_CONDICAO[opcao.valor]}
                  {atual && <Badge>Atual</Badge>}
                </span>
                <span className="text-xs text-muted-foreground">
                  {opcao.descricao}
                </span>
                {bloqueada && (
                  <span className="text-xs text-muted-foreground">
                    De Doente não passa direto para Apto.
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>

      {mudaParaDoente && (
        <div className="flex gap-3 rounded-lg border border-warning-soft-border bg-warning-soft p-3 text-warning-soft-foreground">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-0.5 text-sm">
            <span className="font-medium">{jogador.name} é titular</span>
            <span>
              Ao passar a Doente, ele sai da escalação, e o{' '}
              {props.nomeDoClube ?? 'clube'} só volta a jogar partidas depois de
              escalar de novo os 5 titulares.
            </span>
          </div>
        </div>
      )}

      {erroDaApi && (
        <Alert
          variante="destrutivo"
          titulo="Não foi possível alterar a condição"
        >
          {erroDaApi}
        </Alert>
      )}
    </Dialog>
  );
}
