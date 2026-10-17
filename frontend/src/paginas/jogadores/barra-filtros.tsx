import {
  CircleDollarSign,
  HeartPulse,
  Search,
  Shield,
  Shirt,
  UserRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import type { Condicao, Posicao } from '../../api/tipos';
import { Button } from '../../components/ui/button';
import { Campo } from '../../components/ui/campo';
import { Input } from '../../components/ui/input';
import {
  Popover,
  PopoverConteudo,
  PopoverGatilho,
} from '../../components/ui/popover';
import { textoFaixa, textoFaixaValor } from './filtros';
import { Select, type OpcaoSelect } from '../../components/ui/select';
import {
  ROTULO_CONDICAO,
  ROTULO_POSICAO,
  type EstadoJogadores,
} from './filtros';

export type ClubeOpcao = {
  id: number;
  name: string;
};

type PropsBarraFiltros = {
  estado: EstadoJogadores;
  buscaDigitada: string;
  aoDigitarBusca: (valor: string) => void;
  clubes: ClubeOpcao[];
  aoAlterar: (alteracao: Partial<EstadoJogadores>) => void;
};

const TODOS = '__todos__';

function comValor(rotulo: string, valor?: string): string {
  return valor ? `${rotulo}: ${valor}` : rotulo;
}

export function BarraFiltros({
  estado,
  buscaDigitada,
  aoDigitarBusca,
  clubes,
  aoAlterar,
}: PropsBarraFiltros) {
  const opcoesPosicao: OpcaoSelect[] = [
    { valor: TODOS, rotulo: 'Todas' },
    ...(Object.keys(ROTULO_POSICAO) as Posicao[]).map((p) => ({
      valor: p,
      rotulo: `${p} · ${ROTULO_POSICAO[p]}`,
    })),
  ];
  const opcoesCondicao: OpcaoSelect[] = [
    { valor: TODOS, rotulo: 'Todas' },
    ...(Object.keys(ROTULO_CONDICAO) as Condicao[]).map((c) => ({
      valor: c,
      rotulo: ROTULO_CONDICAO[c],
    })),
  ];
  const opcoesClube: OpcaoSelect[] = [
    { valor: TODOS, rotulo: 'Todos os clubes' },
    ...clubes.map((c) => ({ valor: String(c.id), rotulo: c.name })),
  ];
  const clubeDesabilitado = estado.aba === 'livres';
  const nomeClube = clubes.find((c) => c.id === estado.clube)?.name;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-xs">
        <div className="relative min-w-60 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            aria-label="Buscar por nome"
            placeholder="Buscar por nome"
            className="pl-9"
            value={buscaDigitada}
            onChange={(evento) => aoDigitarBusca(evento.target.value)}
          />
        </div>

        <Select
          ariaLabel="Filtrar por posição"
          valor={estado.posicao ?? TODOS}
          aoAlterar={(valor) =>
            aoAlterar({
              posicao: valor === TODOS ? undefined : (valor as Posicao),
            })
          }
          opcoes={opcoesPosicao}
          textoTrigger={
            <span className="flex items-center gap-2">
              <Shirt className="size-4 text-muted-foreground" />
              {comValor(
                'Posição',
                estado.posicao && ROTULO_POSICAO[estado.posicao],
              )}
            </span>
          }
        />

        <Select
          ariaLabel="Filtrar por condição"
          valor={estado.condicao ?? TODOS}
          aoAlterar={(valor) =>
            aoAlterar({
              condicao: valor === TODOS ? undefined : (valor as Condicao),
            })
          }
          opcoes={opcoesCondicao}
          textoTrigger={
            <span className="flex items-center gap-2">
              <HeartPulse className="size-4 text-muted-foreground" />
              {comValor(
                'Condição',
                estado.condicao && ROTULO_CONDICAO[estado.condicao],
              )}
            </span>
          }
        />

        <Select
          ariaLabel="Filtrar por clube"
          valor={
            estado.clube === undefined || clubeDesabilitado
              ? TODOS
              : String(estado.clube)
          }
          aoAlterar={(valor) =>
            aoAlterar({ clube: valor === TODOS ? undefined : Number(valor) })
          }
          opcoes={opcoesClube}
          desabilitado={clubeDesabilitado}
          textoTrigger={
            <span className="flex items-center gap-2">
              <Shield className="size-4 text-muted-foreground" />
              {clubeDesabilitado ? 'Clube' : comValor('Clube', nomeClube)}
            </span>
          }
        />

        <Popover>
          <PopoverGatilho asChild>
            <Button variante="outline" className="font-normal">
              <UserRound className="size-4 text-muted-foreground" />
              {comValor(
                'Idade',
                estado.idadeMin !== undefined || estado.idadeMax !== undefined
                  ? textoFaixa(
                      estado.idadeMin?.toString(),
                      estado.idadeMax?.toString(),
                    )
                  : undefined,
              )}
            </Button>
          </PopoverGatilho>
          <PopoverConteudo>
            <FormFaixaIdade estado={estado} aoAplicar={aoAlterar} />
          </PopoverConteudo>
        </Popover>

        <Popover>
          <PopoverGatilho asChild>
            <Button variante="outline" className="font-normal">
              <CircleDollarSign className="size-4 text-muted-foreground" />
              {comValor(
                'Valor de mercado',
                estado.valorMin !== undefined || estado.valorMax !== undefined
                  ? textoFaixaValor(estado.valorMin, estado.valorMax)
                  : undefined,
              )}
            </Button>
          </PopoverGatilho>
          <PopoverConteudo>
            <FormFaixaValor estado={estado} aoAplicar={aoAlterar} />
          </PopoverConteudo>
        </Popover>
      </div>
      {buscaDigitada.trim().length === 1 && (
        <p className="text-xs text-muted-foreground">
          Digite pelo menos 2 caracteres para buscar.
        </p>
      )}
      {clubeDesabilitado && (
        <p className="text-xs text-muted-foreground">
          Com a aba “Livres”, o filtro por clube fica desabilitado, porque essa
          combinação não é aceita.
        </p>
      )}
    </div>
  );
}

type PropsFormFaixa = {
  estado: EstadoJogadores;
  aoAplicar: (alteracao: Partial<EstadoJogadores>) => void;
};

function FormFaixaIdade({ estado, aoAplicar }: PropsFormFaixa) {
  const [minimo, setMinimo] = useState(estado.idadeMin?.toString() ?? '');
  const [maximo, setMaximo] = useState(estado.idadeMax?.toString() ?? '');
  const min = minimo === '' ? undefined : Number(minimo);
  const max = maximo === '' ? undefined : Number(maximo);
  const erro =
    (min !== undefined && (!Number.isInteger(min) || min < 16 || min > 45)) ||
    (max !== undefined && (!Number.isInteger(max) || max < 16 || max > 45))
      ? 'Use uma idade de 16 a 45 anos.'
      : min !== undefined && max !== undefined && min > max
        ? 'A idade mínima não pode ser maior que a máxima.'
        : undefined;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(evento) => {
        evento.preventDefault();
        if (!erro) aoAplicar({ idadeMin: min, idadeMax: max });
      }}
    >
      <p className="text-sm font-medium">Idade</p>
      <div className="grid grid-cols-2 gap-3">
        <Campo id="idade-minima" rotulo="De" erro={undefined}>
          <Input
            id="idade-minima"
            inputMode="numeric"
            placeholder="16"
            value={minimo}
            onChange={(e) => setMinimo(e.target.value)}
          />
        </Campo>
        <Campo id="idade-maxima" rotulo="Até" erro={undefined}>
          <Input
            id="idade-maxima"
            inputMode="numeric"
            placeholder="45"
            value={maximo}
            onChange={(e) => setMaximo(e.target.value)}
          />
        </Campo>
      </div>
      {erro && (
        <p className="text-xs text-destructive-soft-foreground">{erro}</p>
      )}
      <div className="flex justify-between gap-2">
        <Button
          type="button"
          variante="ghost"
          tamanho="sm"
          onClick={() =>
            aoAplicar({ idadeMin: undefined, idadeMax: undefined })
          }
        >
          Limpar
        </Button>
        <Button type="submit" tamanho="sm" disabled={erro !== undefined}>
          Aplicar
        </Button>
      </div>
    </form>
  );
}

function FormFaixaValor({ estado, aoAplicar }: PropsFormFaixa) {
  const [minimo, setMinimo] = useState(
    estado.valorMin?.replace('.', ',') ?? '',
  );
  const [maximo, setMaximo] = useState(
    estado.valorMax?.replace('.', ',') ?? '',
  );
  const numero = (texto: string) =>
    texto.trim() === '' ? undefined : Number(texto.replace(',', '.'));
  const min = numero(minimo);
  const max = numero(maximo);
  const formatoValido = /^\d{1,3}([.,]\d{1,2})?$/;
  const erro =
    (minimo !== '' && !formatoValido.test(minimo.trim())) ||
    (maximo !== '' && !formatoValido.test(maximo.trim()))
      ? 'Use um valor como 10 ou 10,50.'
      : (min !== undefined && (min < 0 || min > 550)) ||
          (max !== undefined && (max < 0 || max > 550))
        ? 'Use um valor de 0 a 550.'
        : min !== undefined && max !== undefined && min > max
          ? 'O valor mínimo não pode ser maior que o máximo.'
          : undefined;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(evento) => {
        evento.preventDefault();
        if (erro) return;
        aoAplicar({
          valorMin: min === undefined ? undefined : String(min),
          valorMax: max === undefined ? undefined : String(max),
        });
      }}
    >
      <p className="text-sm font-medium">Valor de mercado (moedas)</p>
      <div className="grid grid-cols-2 gap-3">
        <Campo id="valor-minimo" rotulo="De">
          <Input
            id="valor-minimo"
            inputMode="decimal"
            placeholder="0,00"
            value={minimo}
            onChange={(e) => setMinimo(e.target.value)}
          />
        </Campo>
        <Campo id="valor-maximo" rotulo="Até">
          <Input
            id="valor-maximo"
            inputMode="decimal"
            placeholder="550,00"
            value={maximo}
            onChange={(e) => setMaximo(e.target.value)}
          />
        </Campo>
      </div>
      {erro && (
        <p className="text-xs text-destructive-soft-foreground">{erro}</p>
      )}
      <div className="flex justify-between gap-2">
        <Button
          type="button"
          variante="ghost"
          tamanho="sm"
          onClick={() =>
            aoAplicar({ valorMin: undefined, valorMax: undefined })
          }
        >
          Limpar
        </Button>
        <Button type="submit" tamanho="sm" disabled={erro !== undefined}>
          Aplicar
        </Button>
      </div>
    </form>
  );
}

type PropsChips = {
  clubes: ClubeOpcao[];
  estado: EstadoJogadores;
  aoAlterar: (alteracao: Partial<EstadoJogadores>) => void;
  aoLimparTudo: () => void;
};

export function ChipsFiltros({
  estado,
  clubes,
  aoAlterar,
  aoLimparTudo,
}: PropsChips) {
  const chips: { chave: string; rotulo: string; remover: () => void }[] = [];
  if (estado.busca.trim())
    chips.push({
      chave: 'busca',
      rotulo: `Busca: ${estado.busca.trim()}`,
      remover: () => aoAlterar({ busca: '' }),
    });
  if (estado.posicao)
    chips.push({
      chave: 'posicao',
      rotulo: `Posição: ${ROTULO_POSICAO[estado.posicao]}`,
      remover: () => aoAlterar({ posicao: undefined }),
    });
  if (estado.condicao)
    chips.push({
      chave: 'condicao',
      rotulo: `Condição: ${ROTULO_CONDICAO[estado.condicao]}`,
      remover: () => aoAlterar({ condicao: undefined }),
    });
  if (estado.clube !== undefined)
    chips.push({
      chave: 'clube',
      rotulo: `Clube: ${clubes.find((c) => c.id === estado.clube)?.name ?? estado.clube}`,
      remover: () => aoAlterar({ clube: undefined }),
    });
  if (estado.idadeMin !== undefined || estado.idadeMax !== undefined) {
    chips.push({
      chave: 'idade',
      rotulo: `Idade: ${textoFaixa(estado.idadeMin?.toString(), estado.idadeMax?.toString())}`,
      remover: () => aoAlterar({ idadeMin: undefined, idadeMax: undefined }),
    });
  }
  if (estado.valorMin !== undefined || estado.valorMax !== undefined) {
    chips.push({
      chave: 'valor',
      rotulo: `Valor de mercado: ${textoFaixaValor(estado.valorMin, estado.valorMax)}`,
      remover: () => aoAlterar({ valorMin: undefined, valorMax: undefined }),
    });
  }
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-muted-foreground">Filtros ativos:</span>
      {chips.map((chip) => (
        <span
          key={chip.chave}
          className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary py-0.5 pr-1 pl-2.5 text-xs font-medium"
        >
          {chip.rotulo}
          <button
            type="button"
            aria-label={`Remover filtro ${chip.rotulo}`}
            onClick={chip.remover}
            className="rounded p-0.5 hover:bg-accent"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <Button
        variante="ghost"
        tamanho="sm"
        className="h-7 text-primary"
        onClick={aoLimparTudo}
      >
        Limpar filtros
      </Button>
    </div>
  );
}
