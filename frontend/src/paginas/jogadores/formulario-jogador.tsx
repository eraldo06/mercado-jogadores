import { Lock } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ErroApi } from '../../api/cliente';
import type { EdicaoJogador, Jogador, NovoJogador } from '../../api/jogadores';
import type { Posicao } from '../../api/tipos';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Campo } from '../../components/ui/campo';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { moeda } from '../../lib/formatar';
import { cn } from '../../lib/utils';
import { ROTULO_POSICAO } from './filtros';
import {
  ATRIBUTOS,
  numeroDoCampo,
  validarCadastro,
  validarEdicao,
  type ChaveAtributo,
  type ErrosFormulario,
  type ValoresFormulario,
} from './validacao-jogador';

const POSICOES = Object.keys(ROTULO_POSICAO) as Posicao[];

const ROTULO_ATRIBUTO: Record<ChaveAtributo, string> = {
  pace: 'Velocidade',
  shooting: 'Finalização',
  passing: 'Passe',
  dribbling: 'Drible',
  defending: 'Defesa',
  physical: 'Físico',
};

type PropsFormularioJogador =
  | {
      aberto: boolean;
      aoFechar: () => void;
      modo: 'criar';
      carregando: boolean;
      erroApi: unknown;
      aoSalvar: (dados: NovoJogador) => void;
    }
  | {
      aberto: boolean;
      aoFechar: () => void;
      modo: 'editar';
      jogador: Jogador;
      emClube: boolean;
      carregando: boolean;
      erroApi: unknown;
      aoSalvar: (dados: EdicaoJogador) => void;
    };

function valoresIniciais(props: PropsFormularioJogador): ValoresFormulario {
  if (props.modo === 'editar') {
    const { jogador } = props;
    return {
      nome: jogador.name,
      posicao: jogador.position,
      idade: String(jogador.age),
      agilidade: String(jogador.agility),
    };
  }
  return {};
}

function mensagemDeErro(erro: unknown): string | undefined {
  if (erro === null || erro === undefined) return undefined;
  if (erro instanceof ErroApi) return erro.message;
  return 'Não foi possível salvar. Verifique a conexão e tente de novo.';
}

export function FormularioJogador(props: PropsFormularioJogador) {
  const [valores, setValores] = useState<ValoresFormulario>(() =>
    valoresIniciais(props),
  );
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const idFormulario = 'formulario-jogador';
  const criando = props.modo === 'criar';
  const erroDaApi = mensagemDeErro(props.erroApi);

  const definir = (campo: string, valor: string) => {
    const novos = { ...valores, [campo]: valor };
    setValores(novos);
    if (tentouEnviar) {
      setErros(
        props.modo === 'criar'
          ? validarCadastro(novos).erros
          : validarEdicao(novos, props.jogador.age).erros,
      );
    }
  };

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setTentouEnviar(true);
    if (props.modo === 'criar') {
      const { dados, erros: novos } = validarCadastro(valores);
      setErros(novos);
      if (dados) {
        props.aoSalvar({
          name: dados.nome,
          position: dados.posicao,
          agility: dados.agilidade,
          age: dados.idade,
          pace: dados.pace,
          shooting: dados.shooting,
          passing: dados.passing,
          dribbling: dados.dribbling,
          defending: dados.defending,
          physical: dados.physical,
          potential: dados.potencial,
        });
      }
    } else {
      const { dados, erros: novos } = validarEdicao(valores, props.jogador.age);
      setErros(novos);
      if (dados)
        props.aoSalvar({
          name: dados.nome,
          position: dados.posicao,
          agility: dados.agilidade,
          age: dados.idade,
        });
    }
  };

  const posicaoSelecionada = valores.posicao as Posicao | undefined;
  const posicaoTravada = props.modo === 'editar' && props.emClube;
  const atributos = ATRIBUTOS.map((chave) => ({
    chave,
    valor: numeroDoCampo(valores[chave]),
  }));
  const maiorAtributo = Math.max(
    0,
    ...atributos.map((a) => (Number.isNaN(a.valor) ? 0 : a.valor)),
  );

  return (
    <Dialog
      aberto={props.aberto}
      aoAlterarAbertura={(aberto) => !aberto && props.aoFechar()}
      titulo={criando ? 'Novo jogador' : 'Editar jogador'}
      descricao={
        criando
          ? 'Preencha os dados e os indicadores técnicos. O valor base, o overall e o valor de mercado são calculados ao salvar.'
          : 'Edite nome, posição, idade e agilidade. Os demais dados não mudam.'
      }
      largura={criando ? 'xl' : 'md'}
      rodape={
        <>
          {criando && (
            <span className="mr-auto self-center text-xs text-muted-foreground">
              O jogador começa livre e Apto.
            </span>
          )}
          <Button
            variante="outline"
            onClick={props.aoFechar}
            disabled={props.carregando}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form={idFormulario}
            carregando={props.carregando}
          >
            {criando ? 'Salvar jogador' : 'Salvar alterações'}
          </Button>
        </>
      }
    >
      <form
        id={idFormulario}
        onSubmit={enviar}
        noValidate
        className="flex flex-col gap-5"
      >
        {erroDaApi && (
          <Alert
            variante="destrutivo"
            titulo={
              criando
                ? 'Não foi possível salvar o jogador'
                : 'Não foi possível salvar'
            }
          >
            {erroDaApi}
          </Alert>
        )}

        <Campo
          id="jogador-nome"
          rotulo="Nome"
          erro={erros.nome}
          ajuda={
            erros.nome
              ? undefined
              : 'De 3 a 100 caracteres, com pelo menos duas palavras e sem números.'
          }
        >
          <Input
            id="jogador-nome"
            value={valores.nome ?? ''}
            onChange={(e) => definir('nome', e.target.value)}
            aria-invalid={erros.nome ? true : undefined}
          />
        </Campo>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium">Posição</legend>
          <div className="grid grid-cols-5 gap-2">
            {POSICOES.map((posicao) => {
              const selecionada = posicaoSelecionada === posicao;
              const desabilitada = posicaoTravada && !selecionada;
              return (
                <button
                  key={posicao}
                  type="button"
                  aria-pressed={selecionada}
                  disabled={desabilitada}
                  onClick={() => definir('posicao', posicao)}
                  className={cn(
                    'flex flex-col items-center rounded-md border px-2 py-2 text-sm transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50',
                    selecionada
                      ? 'border-primary bg-primary-soft text-primary'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  <span className="font-semibold">{posicao}</span>
                  <span className="text-xs text-muted-foreground">
                    {ROTULO_POSICAO[posicao]}
                  </span>
                </button>
              );
            })}
          </div>
          {erros.posicao && (
            <p className="text-xs text-destructive-soft-foreground">
              {erros.posicao}
            </p>
          )}
          {posicaoTravada && (
            <p className="text-xs text-muted-foreground">
              Jogador com clube não muda de posição: as outras posições ficam
              desabilitadas.
            </p>
          )}
        </fieldset>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Campo
            id="jogador-idade"
            rotulo="Idade"
            erro={erros.idade}
            ajuda={
              erros.idade
                ? undefined
                : criando
                  ? 'De 16 a 45 anos.'
                  : `De 16 a 45, sem diminuir (atual: ${props.modo === 'editar' ? props.jogador.age : ''}).`
            }
          >
            <Input
              id="jogador-idade"
              inputMode="numeric"
              value={valores.idade ?? ''}
              onChange={(e) => definir('idade', e.target.value)}
            />
          </Campo>
          <Campo
            id="jogador-agilidade"
            rotulo="Agilidade"
            erro={erros.agilidade}
            ajuda={
              erros.agilidade
                ? undefined
                : 'De 1 a 100 (até 85 com 35 anos ou mais).'
            }
          >
            <Input
              id="jogador-agilidade"
              inputMode="numeric"
              value={valores.agilidade ?? ''}
              onChange={(e) => definir('agilidade', e.target.value)}
            />
          </Campo>
          {criando ? (
            <Campo
              id="jogador-valor-base"
              rotulo="Valor base (moedas)"
              ajuda="Calculado no cadastro."
            >
              <CampoBloqueado texto="Após salvar" />
            </Campo>
          ) : null}
        </div>

        {criando ? (
          <section className="flex flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <h3 className="text-sm font-semibold">Indicadores técnicos</h3>
              <p className="text-xs text-muted-foreground">
                Seis atributos e o potencial, de 1 a 99. Não mudam depois do
                cadastro; a soma dos seis atributos não pode passar de 480.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-[1fr_16rem]">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ATRIBUTOS.map((chave) => (
                  <Campo
                    key={chave}
                    id={`jogador-${chave}`}
                    rotulo={ROTULO_ATRIBUTO[chave]}
                    erro={erros[chave]}
                  >
                    <Input
                      id={`jogador-${chave}`}
                      inputMode="numeric"
                      value={valores[chave] ?? ''}
                      onChange={(e) => definir(chave, e.target.value)}
                    />
                  </Campo>
                ))}
                <Campo
                  id="jogador-potencial"
                  rotulo="Potencial"
                  erro={erros.potencial}
                  ajuda={
                    erros.potencial
                      ? undefined
                      : 'Igual ou maior que o maior atributo; igual a ele com 33+ anos.'
                  }
                >
                  <Input
                    id="jogador-potencial"
                    inputMode="numeric"
                    value={valores.potencial ?? ''}
                    onChange={(e) => definir('potencial', e.target.value)}
                  />
                </Campo>
                <Campo
                  id="jogador-overall"
                  rotulo="Overall"
                  ajuda="Calculado automaticamente."
                >
                  <CampoBloqueado texto="Após salvar" />
                </Campo>
              </div>
              <PrevaAtributos
                atributos={atributos}
                maiorAtributo={maiorAtributo}
              />
            </div>
          </section>
        ) : (
          <div className="flex items-start gap-2 rounded-md border border-dashed border-border bg-muted-subtle p-3 text-xs text-muted-foreground">
            <Lock className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            Não mudam depois do cadastro: valor base (
            {moeda(props.jogador.base_value)}), indicadores e potencial.
          </div>
        )}
      </form>
    </Dialog>
  );
}

function CampoBloqueado({ texto }: { texto: string }): ReactNode {
  return (
    <div className="flex h-9 items-center gap-2 rounded-md border border-dashed border-border bg-muted-subtle px-3 text-sm whitespace-nowrap text-muted-foreground">
      <Lock className="size-3.5" aria-hidden="true" />
      {texto}
    </div>
  );
}

type PropsPreva = {
  atributos: { chave: ChaveAtributo; valor: number }[];
  maiorAtributo: number;
};

function PrevaAtributos({ atributos, maiorAtributo }: PropsPreva) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted-subtle p-3">
      <p className="text-xs font-medium text-muted-foreground">
        Prévia dos atributos
      </p>
      {atributos.map(({ chave, valor }) => {
        const valida = !Number.isNaN(valor);
        return (
          <div
            key={chave}
            className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-2 text-xs"
          >
            <span className="text-muted-foreground">
              {ROTULO_ATRIBUTO[chave]}
            </span>
            <span className="h-1.5 overflow-hidden rounded-full bg-muted">
              <span
                className="block h-full rounded-full bg-primary"
                style={{
                  width: `${valida ? Math.min(Math.max(valor, 0), 99) : 0}%`,
                }}
              />
            </span>
            <span className="text-right tabular-nums">
              {valida ? valor : '—'}
            </span>
          </div>
        );
      })}
      <p className="text-xs text-muted-foreground">
        Faixa clara: até o potencial. A prévia só desenha os valores digitados;
        não calcula overall nem valor base.
        {maiorAtributo > 0 && ` Maior atributo: ${maiorAtributo}.`}
      </p>
    </div>
  );
}
