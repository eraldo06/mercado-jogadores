import { ArrowUpDown, ChevronRight, Plus, Shield } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { ErroApi } from '../../api/cliente';
import type { ClubeResumo, OrdemClubes } from '../../api/clubes';
import { CabecalhoPagina } from '../../components/compartilhados/cabecalho-pagina';
import { EstadoErro } from '../../components/compartilhados/estado-erro';
import {
  TabelaDados,
  type ColunaTabela,
} from '../../components/compartilhados/tabela-dados';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, type OpcaoSelect } from '../../components/ui/select';
import { useCriarClube, useListaClubes } from '../../consultas/clubes';
import { moeda } from '../../lib/formatar';
import { FormularioClube } from './formulario-clube';

const MAXIMO_CLUBES = 20;

const ROTULO_ORDEM_CLUBES: Record<OrdemClubes, string> = {
  name: 'Nome',
  net_worth_desc: 'Patrimônio (maior para o menor)',
  net_worth_asc: 'Patrimônio (menor para o maior)',
};

const OPCOES_ORDEM: OpcaoSelect[] = (
  Object.keys(ROTULO_ORDEM_CLUBES) as OrdemClubes[]
).map((valor) => ({
  valor,
  rotulo: ROTULO_ORDEM_CLUBES[valor],
}));

const colunas: ColunaTabela<ClubeResumo>[] = [
  {
    chave: 'clube',
    titulo: 'Clube',
    render: (clube) => (
      <div className="flex items-center gap-3">
        <span className="flex h-7 min-w-9 items-center justify-center rounded-md border border-border bg-muted-subtle px-1.5 text-xs font-medium">
          {clube.acronym}
        </span>
        <span className="font-medium">{clube.name}</span>
      </div>
    ),
  },
  {
    chave: 'sigla',
    titulo: 'Sigla',
    render: (clube) => <Badge>{clube.acronym}</Badge>,
  },
  {
    chave: 'caixa',
    titulo: 'Caixa',
    alinhamento: 'direita',
    render: (clube) => (
      <span className="tabular-nums">{moeda(clube.cash)}</span>
    ),
  },
  {
    chave: 'elenco',
    titulo: 'Valor do elenco',
    alinhamento: 'direita',
    render: (clube) => (
      <span className="tabular-nums">{moeda(clube.squad_value)}</span>
    ),
  },
  {
    chave: 'patrimonio',
    titulo: 'Patrimônio',
    alinhamento: 'direita',
    render: (clube) => (
      <span className="font-semibold tabular-nums">
        {moeda(clube.net_worth)}
      </span>
    ),
  },
  {
    chave: 'ver',
    titulo: '',
    alinhamento: 'direita',
    render: (clube) => (
      <Link
        to={`/clubes/${clube.id}`}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium hover:bg-accent"
      >
        Ver clube
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    ),
  },
];

function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroApi) return erro.message;
  return 'Não foi possível carregar os clubes. Verifique a conexão e tente de novo.';
}

export function PaginaClubes() {
  const [ordem, setOrdem] = useState<OrdemClubes>('name');
  // o formulário de novo clube fica na URL (?novo) para o "+" da barra lateral abrir também
  const [parametros, setParametros] = useSearchParams();
  const criando = parametros.has('novo');
  const lista = useListaClubes(ordem);
  const criar = useCriarClube();
  const navegar = useNavigate();
  const clubes = lista.data ?? [];
  const estado = lista.isPending
    ? 'carregando'
    : lista.isError
      ? 'erro'
      : 'pronto';

  return (
    <div className="flex flex-col gap-6">
      <CabecalhoPagina
        icone={Shield}
        titulo="Clubes"
        descricao="Cada clube começa com 300,00 em caixa e sem jogadores. A liga aceita no máximo 20 clubes."
        acao={
          <Button
            onClick={() => {
              criar.reset();
              setParametros({ novo: '1' });
            }}
          >
            <Plus />
            Novo clube
          </Button>
        }
      />

      <div className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-xl border border-b-0 border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">
              {clubes.length} {clubes.length === 1 ? 'clube' : 'clubes'}
            </span>
            <Badge>
              {clubes.length} de {MAXIMO_CLUBES}
            </Badge>
          </div>
          <Select
            ariaLabel="Ordenar clubes"
            valor={ordem}
            aoAlterar={(valor) => setOrdem(valor as OrdemClubes)}
            opcoes={OPCOES_ORDEM}
            textoTrigger={
              <span className="flex items-center gap-2">
                <ArrowUpDown
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {`Ordenar: ${ROTULO_ORDEM_CLUBES[ordem].toLowerCase()}`}
              </span>
            }
          />
        </div>

        {estado === 'erro' ? (
          <div className="rounded-b-xl border border-border bg-card">
            <EstadoErro
              titulo="Não foi possível carregar os clubes"
              descricao={mensagemDeErro(lista.error)}
              aoTentarNovamente={() => void lista.refetch()}
            />
          </div>
        ) : (
          <TabelaDados
            colunas={colunas}
            linhas={clubes}
            chaveLinha={(clube) => clube.id}
            estado={estado}
            vazio={{
              icone: Shield,
              titulo: 'Nenhum clube cadastrado',
              descricao:
                'Crie o primeiro clube com nome e sigla. Ele começa com 300,00 em caixa e sem jogadores.',
              acao: (
                <Button
                  variante="outline"
                  onClick={() => setParametros({ novo: '1' })}
                >
                  <Plus />
                  Novo clube
                </Button>
              ),
            }}
          />
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Clubes pelo nome por padrão ou pelo patrimônio, do maior para o menor,
        com empate desfeito pelo nome.
      </p>

      {criando && (
        <FormularioClube
          aoFechar={() => setParametros({})}
          carregando={criar.isPending}
          erroApi={criar.error}
          aoSalvar={(dados) =>
            criar.mutate(dados, {
              onSuccess: (clube) => {
                setParametros({});
                toast.success('Clube criado', {
                  description: `${clube.name} (${clube.acronym}) começa com ${moeda(clube.cash)} em caixa.`,
                });
                navegar(`/clubes/${clube.id}`);
              },
            })
          }
        />
      )}
    </div>
  );
}
