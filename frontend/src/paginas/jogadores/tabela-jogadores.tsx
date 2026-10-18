import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router';
import type { Jogador } from '../../api/jogadores';
import type { ColunaTabela } from '../../components/compartilhados/tabela-dados';
import { AvatarIniciais } from '../../components/compartilhados/avatar-iniciais';
import { BarraAgilidade } from '../../components/compartilhados/barra-agilidade';
import { CondicaoBadge } from '../../components/compartilhados/condicao-badge';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { moeda } from '../../lib/formatar';
import { ROTULO_POSICAO } from './filtros';
import { MenuAcoesJogador } from './menu-acoes-jogador';

export type ClubeNaTabela = {
  name: string;
  acronym: string;
};

type AcoesJogador = {
  aoEditar: (jogador: Jogador) => void;
  aoAlterarCondicao: (jogador: Jogador) => void;
  aoComprar: (jogador: Jogador) => void;
  aoExcluir: (jogador: Jogador) => void;
};

export function colunasJogadores(
  clubesPorId: Map<number, ClubeNaTabela>,
  acoes: AcoesJogador,
): ColunaTabela<Jogador>[] {
  return [
    {
      chave: 'jogador',
      titulo: 'Jogador',
      render: (jogador) => (
        <div className="flex items-center gap-3">
          <AvatarIniciais nome={jogador.name} chave={jogador.id} />
          <div className="flex flex-col">
            <span className="font-medium">{jogador.name}</span>
            <span className="text-xs text-muted-foreground">
              {ROTULO_POSICAO[jogador.position]}
            </span>
          </div>
        </div>
      ),
    },
    {
      chave: 'posicao',
      titulo: 'Posição',
      render: (jogador) => (
        <Badge className="font-mono">{jogador.position}</Badge>
      ),
    },
    {
      chave: 'overall',
      titulo: 'Overall',
      alinhamento: 'direita',
      render: (jogador) => (
        <span className="font-semibold tabular-nums">{jogador.overall}</span>
      ),
    },
    {
      chave: 'agilidade',
      titulo: 'Agilidade',
      render: (jogador) => <BarraAgilidade valor={jogador.agility} />,
    },
    {
      chave: 'idade',
      titulo: 'Idade',
      alinhamento: 'direita',
      render: (jogador) => <span className="tabular-nums">{jogador.age}</span>,
    },
    {
      chave: 'condicao',
      titulo: 'Condição',
      render: (jogador) => <CondicaoBadge condicao={jogador.condition} />,
    },
    {
      chave: 'valorBase',
      titulo: 'Valor base',
      alinhamento: 'direita',
      render: (jogador) => (
        <span className="text-muted-foreground tabular-nums">
          {moeda(jogador.base_value)}
        </span>
      ),
    },
    {
      chave: 'valorMercado',
      titulo: 'Valor de mercado',
      alinhamento: 'direita',
      render: (jogador) => (
        <span className="font-semibold tabular-nums">
          {moeda(jogador.market_value)}
        </span>
      ),
    },
    {
      chave: 'clube',
      titulo: 'Clube',
      render: (jogador) => {
        if (jogador.club_id === null) {
          return <Badge>Livre</Badge>;
        }
        const clube = clubesPorId.get(jogador.club_id);
        return (
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-border px-1.5 py-0.5 text-xs font-medium">
              {clube?.acronym ?? '—'}
            </span>
            <Link
              to={`/clubes/${jogador.club_id}`}
              className="underline underline-offset-2"
            >
              {clube?.name ?? `Clube ${jogador.club_id}`}
            </Link>
          </div>
        );
      },
    },
    {
      chave: 'acoes',
      titulo: '',
      alinhamento: 'direita',
      render: (jogador) => (
        <div className="flex items-center justify-end gap-2">
          {jogador.club_id === null && (
            <Button variante="outline" onClick={() => acoes.aoComprar(jogador)}>
              <ShoppingCart aria-hidden="true" />
              Comprar
            </Button>
          )}
          <MenuAcoesJogador
            jogador={jogador}
            aoEditar={acoes.aoEditar}
            aoAlterarCondicao={acoes.aoAlterarCondicao}
            aoComprar={acoes.aoComprar}
            aoExcluir={acoes.aoExcluir}
          />
        </div>
      ),
    },
  ];
}
