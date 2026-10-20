import * as DialogPrimitivo from '@radix-ui/react-dialog';
import {
  ChartColumn,
  Coins,
  Heart,
  Pencil,
  ShoppingCart,
  Tag,
  TrendingUp,
  X,
} from 'lucide-react';
import type { Jogador } from '../../api/jogadores';
import { AvatarIniciais } from '../../components/compartilhados/avatar-iniciais';
import { CondicaoBadge } from '../../components/compartilhados/condicao-badge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { moeda } from '../../lib/formatar';
import { ROTULO_POSICAO } from './filtros';

const ATRIBUTOS: {
  chave: keyof Pick<
    Jogador,
    'pace' | 'shooting' | 'passing' | 'dribbling' | 'defending' | 'physical'
  >;
  rotulo: string;
}[] = [
  { chave: 'pace', rotulo: 'Velocidade' },
  { chave: 'shooting', rotulo: 'Finalização' },
  { chave: 'passing', rotulo: 'Passe' },
  { chave: 'dribbling', rotulo: 'Drible' },
  { chave: 'defending', rotulo: 'Defesa' },
  { chave: 'physical', rotulo: 'Físico' },
];

const ESCALA_MAXIMA = 99;

function porcentagem(valor: number): string {
  return `${(valor / ESCALA_MAXIMA) * 100}%`;
}

type CartaoIndicador = {
  icone: typeof Coins;
  rotulo: string;
  valor: string;
  ajuda: string;
};

function Cartao({ icone: Icone, rotulo, valor, ajuda }: CartaoIndicador) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        {rotulo}
        <Icone className="size-4" aria-hidden="true" />
      </div>
      <span className="text-2xl font-semibold tabular-nums">{valor}</span>
      <span className="text-xs text-muted-foreground">{ajuda}</span>
    </div>
  );
}

type PropsDrawerDetalhes = {
  jogador: Jogador | null;
  nomeDoClube?: string;
  aoFechar: () => void;
  aoEditar: (jogador: Jogador) => void;
  aoAlterarCondicao: (jogador: Jogador) => void;
  aoComprar: (jogador: Jogador) => void;
};

export function DrawerDetalhesJogador({
  jogador,
  nomeDoClube,
  aoFechar,
  aoEditar,
  aoAlterarCondicao,
  aoComprar,
}: PropsDrawerDetalhes) {
  const livre = jogador?.club_id === null;

  return (
    <DialogPrimitivo.Root
      open={jogador !== null}
      onOpenChange={(aberto) => !aberto && aoFechar()}
    >
      <DialogPrimitivo.Portal>
        <DialogPrimitivo.Overlay className="fixed inset-0 z-50 bg-overlay" />
        {jogador && (
          <DialogPrimitivo.Content
            data-slot="drawer-detalhes"
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col gap-6 overflow-y-auto border-l border-border bg-popover p-6 text-popover-foreground shadow-lg outline-none"
          >
            <div className="flex items-start gap-3 pr-8">
              <AvatarIniciais nome={jogador.name} chave={jogador.id} />
              <div className="flex min-w-0 flex-col gap-2">
                <DialogPrimitivo.Title className="truncate text-lg leading-6 font-semibold">
                  {jogador.name}
                </DialogPrimitivo.Title>
                <DialogPrimitivo.Description className="sr-only">
                  Detalhes do jogador {jogador.name}
                </DialogPrimitivo.Description>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{jogador.position}</Badge>
                  <CondicaoBadge condicao={jogador.condition} />
                  <Badge>{livre ? 'Livre' : (nomeDoClube ?? 'Em clube')}</Badge>
                </div>
              </div>
            </div>
            <DialogPrimitivo.Close
              aria-label="Fechar"
              className="absolute top-4 right-4 rounded-md p-1 text-muted-foreground opacity-80 outline-none hover:opacity-100 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <X className="size-4" />
            </DialogPrimitivo.Close>

            <div className="grid grid-cols-2 gap-3">
              <Cartao
                icone={Coins}
                rotulo="Valor de mercado"
                valor={moeda(jogador.market_value)}
                ajuda="Calculado automaticamente"
              />
              <Cartao
                icone={Tag}
                rotulo="Valor base"
                valor={moeda(jogador.base_value)}
                ajuda="Calculado no cadastro"
              />
              <Cartao
                icone={ChartColumn}
                rotulo="Overall"
                valor={String(jogador.overall)}
                ajuda={`Calculado pela posição ${ROTULO_POSICAO[jogador.position].toLowerCase()}`}
              />
              <Cartao
                icone={TrendingUp}
                rotulo="Potencial"
                valor={String(jogador.potential)}
                ajuda="Informado no cadastro"
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-baseline justify-between">
                <span className="font-semibold">Indicadores técnicos</span>
                <span className="text-xs text-muted-foreground">
                  Escala de 1 a {ESCALA_MAXIMA}
                </span>
              </div>
              {ATRIBUTOS.map(({ chave, rotulo }) => (
                <div key={chave} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0">{rotulo}</span>
                  <div className="relative h-2 flex-1 rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary/30"
                      style={{ width: porcentagem(jogador.potential) }}
                    />
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-primary"
                      style={{ width: porcentagem(jogador[chave]) }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium tabular-nums">
                    {jogador[chave]}
                  </span>
                </div>
              ))}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-sm bg-primary"
                    aria-hidden="true"
                  />
                  Valor do atributo
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="size-2.5 rounded-sm bg-primary/30"
                    aria-hidden="true"
                  />
                  Até o potencial ({jogador.potential}), que nenhum atributo
                  passa
                </span>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-muted-foreground">Idade</span>
                <span className="font-medium">{jogador.age} anos</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-muted-foreground">Agilidade</span>
                <span className="font-medium">{jogador.agility}</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-muted-foreground">Clube</span>
                <span className="font-medium">
                  {livre ? 'Livre' : nomeDoClube}
                </span>
              </div>
            </div>

            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variante="outline"
                  onClick={() => {
                    aoFechar();
                    aoEditar(jogador);
                  }}
                >
                  <Pencil />
                  Editar
                </Button>
                <Button
                  variante="outline"
                  onClick={() => {
                    aoFechar();
                    aoAlterarCondicao(jogador);
                  }}
                >
                  <Heart />
                  Alterar condição
                </Button>
              </div>
              {livre && (
                <Button
                  onClick={() => {
                    aoFechar();
                    aoComprar(jogador);
                  }}
                >
                  <ShoppingCart />
                  Comprar
                </Button>
              )}
            </div>
          </DialogPrimitivo.Content>
        )}
      </DialogPrimitivo.Portal>
    </DialogPrimitivo.Root>
  );
}
