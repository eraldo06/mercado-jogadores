import {
  Calendar,
  Clock,
  Info,
  RefreshCw,
  Shield,
  ShoppingCart,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ErroApi } from '../../api/cliente';
import type { ClubeResumo } from '../../api/clubes';
import type { Jogador } from '../../api/jogadores';
import type { NovaCompra } from '../../api/mercado';
import { AvatarIniciais } from '../../components/compartilhados/avatar-iniciais';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { moeda } from '../../lib/formatar';
import { ROTULO_POSICAO } from './filtros';
import {
  validarCompra,
  type ErrosCompra,
  type ValoresCompra,
} from './validacao-compra';

const ID_FORMULARIO = 'formulario-compra';
// Valores iniciais da tela de referência (fotos 44 a 51); a banca troca à vontade.
const VALORES_INICIAIS: ValoresCompra = {
  clube: '',
  data: '2027-11-12',
  hora: '15:00',
};

type PropsDialogComprar = {
  jogador: Jogador;
  clubes: ClubeResumo[];
  aoFechar: () => void;
  carregando: boolean;
  erroApi: unknown;
  aoSalvar: (dados: NovaCompra) => void;
};

export function DialogComprar(props: PropsDialogComprar) {
  const { jogador, clubes, carregando } = props;
  const [valores, setValores] = useState<ValoresCompra>(VALORES_INICIAIS);
  const [erros, setErros] = useState<ErrosCompra>({});
  const [tentouEnviar, setTentouEnviar] = useState(false);

  const clubeEscolhido = clubes.find(
    (clube) => String(clube.id) === valores.clube,
  );
  const semConexao =
    Boolean(props.erroApi) && !(props.erroApi instanceof ErroApi);
  const erroDaApi =
    props.erroApi instanceof ErroApi ? props.erroApi.message : undefined;

  const definir = (campo: keyof ValoresCompra, valor: string) => {
    const novos = { ...valores, [campo]: valor };
    setValores(novos);
    if (tentouEnviar) {
      setErros(validarCompra(novos).erros);
    }
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setTentouEnviar(true);
    const { dados, erros: novos } = validarCompra(valores);
    setErros(novos);
    if (dados) {
      props.aoSalvar(dados);
    }
  };

  return (
    <Dialog
      aberto
      largura="xl"
      aoAlterarAbertura={(aberto) => !aberto && props.aoFechar()}
      titulo="Comprar jogador"
      descricao="Escolha o clube comprador e até quando vai a fidelidade do contrato."
      rodape={
        <>
          <Button
            variante="outline"
            onClick={props.aoFechar}
            disabled={carregando}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={ID_FORMULARIO}
            carregando={carregando}
            disabled={carregando}
          >
            {!carregando && (semConexao ? <RefreshCw /> : <ShoppingCart />)}
            {carregando
              ? 'Comprando…'
              : semConexao
                ? 'Tentar de novo'
                : 'Confirmar compra'}
          </Button>
        </>
      }
    >
      <form
        id={ID_FORMULARIO}
        onSubmit={enviar}
        noValidate
        className="flex flex-col gap-4"
      >
        {erroDaApi && (
          <Alert variante="destrutivo" titulo="Compra recusada">
            {erroDaApi}
          </Alert>
        )}

        {semConexao && (
          <Alert variante="destrutivo" titulo="Sem conexão">
            A compra não foi confirmada. Verifique a conexão e tente de novo.
          </Alert>
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

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-2.5 text-sm font-medium">
            Clube comprador
          </legend>
          <Select
            ariaLabel="Clube comprador"
            valor={valores.clube}
            aoAlterar={(valor) => definir('clube', valor)}
            opcoes={clubes.map((clube) => ({
              valor: String(clube.id),
              rotulo: `${clube.name} (${clube.acronym}) · caixa ${moeda(clube.cash)}`,
            }))}
            textoTrigger={
              <span className="flex items-center gap-2">
                <Shield
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {clubeEscolhido
                  ? `${clubeEscolhido.name} (${clubeEscolhido.acronym}) · caixa ${moeda(clubeEscolhido.cash)}`
                  : 'Escolha um clube'}
              </span>
            }
            className="w-full justify-between pl-4"
          />
          {erros.clube ? (
            <p className="text-xs text-destructive-soft-foreground">
              {erros.clube}
            </p>
          ) : (
            clubeEscolhido && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Caixa atual: {moeda(clubeEscolhido.cash)}. O custo total (valor
                + taxa) pode ir até 50% do caixa.
              </p>
            )
          )}
        </fieldset>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-2.5 text-sm font-medium">
            Fim da fidelidade
          </legend>
          <div className="grid grid-cols-[1fr_8.125rem] gap-2">
            <div className="relative">
              <Calendar
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="compra-data"
                type="date"
                aria-label="Data do fim da fidelidade"
                value={valores.data}
                onChange={(e) => definir('data', e.target.value)}
                aria-invalid={erros.data ? true : undefined}
                className="pl-9 [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
            <div className="relative">
              <Clock
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="compra-hora"
                type="time"
                step={60}
                aria-label="Hora do fim da fidelidade"
                value={valores.hora}
                onChange={(e) => definir('hora', e.target.value)}
                aria-invalid={erros.hora ? true : undefined}
                className="pl-9 [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
          </div>
          {erros.data || erros.hora ? (
            <p className="text-xs text-destructive-soft-foreground">
              {erros.data ?? erros.hora}
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Depois do momento da compra e até 1.095 dias. Horário de Brasília;
              enviado com o fuso (-03:00).
            </p>
          )}
        </fieldset>

        <div className="flex gap-3 rounded-lg border border-border bg-muted-subtle px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            A taxa é de 5% do valor de mercado, só quando ele passa de 30,00.
            Taxa, custo e novo caixa são calculados ao confirmar.
          </span>
        </div>

        {carregando && (
          <div className="flex gap-3 rounded-lg border border-border bg-muted-subtle px-3 py-2 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Enviando a compra. Os botões ficam desabilitados até a resposta.
            </span>
          </div>
        )}
      </form>
    </Dialog>
  );
}
