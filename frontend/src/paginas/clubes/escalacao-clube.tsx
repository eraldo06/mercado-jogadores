import {
  CircleCheck,
  ClipboardList,
  Lock,
  Save,
  TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ErroApi } from '../../api/cliente';
import type { JogadorDoClube } from '../../api/clubes';
import type { Escalacao } from '../../api/liga';
import type { Formacao, Posicao } from '../../api/tipos';
import { AvatarIniciais } from '../../components/compartilhados/avatar-iniciais';
import { CondicaoBadge } from '../../components/compartilhados/condicao-badge';
import { Alert } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import { useSalvarEscalacao } from '../../consultas/liga';
import { cn } from '../../lib/utils';

type Grupo = 'GOL' | 'DEF' | 'MEI' | 'ATA';
type Vaga = {
  grupo: Grupo;
  posicoes: Posicao[];
  rotulo: string;
  sigla: string;
};

const FORMACOES: {
  valor: Formacao;
  defesa: number;
  meio: number;
  ataque: number;
}[] = [
  { valor: '3-1', defesa: 3, meio: 0, ataque: 1 },
  { valor: '2-2', defesa: 2, meio: 0, ataque: 2 },
  { valor: '2-1-1', defesa: 2, meio: 1, ataque: 1 },
  { valor: '1-2-1', defesa: 1, meio: 2, ataque: 1 },
];

const ROTULO_FORMACAO: Record<Formacao, string> = {
  '3-1': 'Defesa 3, ataque 1',
  '2-2': 'Defesa 2, ataque 2',
  '2-1-1': 'Defesa 2, meio 1, ataque 1',
  '1-2-1': 'Defesa 1, meio 2, ataque 1',
};

function vagasDa(formacao: Formacao): Vaga[] {
  const dados = FORMACOES.find((f) => f.valor === formacao)!;
  return [
    { grupo: 'GOL', posicoes: ['GOL'], rotulo: 'Goleiro', sigla: 'GOL' },
    ...Array.from({ length: dados.defesa }, (): Vaga => ({
      grupo: 'DEF',
      posicoes: ['ZAG', 'LAT'],
      rotulo: 'Defesa',
      sigla: 'ZAG ou LAT',
    })),
    ...Array.from({ length: dados.meio }, (): Vaga => ({
      grupo: 'MEI',
      posicoes: ['MEI'],
      rotulo: 'Meio',
      sigla: 'MEI',
    })),
    ...Array.from({ length: dados.ataque }, (): Vaga => ({
      grupo: 'ATA',
      posicoes: ['ATA'],
      rotulo: 'Ataque',
      sigla: 'ATA',
    })),
  ];
}

// Atributos usados por posição (RN20): atacante usa o da posição; defensor usa a defesa.
function atributosUsados(jogador: JogadorDoClube): string {
  switch (jogador.position) {
    case 'GOL':
    case 'ZAG':
      return `Defesa ${jogador.defending}`;
    case 'LAT':
      return `Drible ${jogador.dribbling}  Defesa ${jogador.defending}`;
    case 'MEI':
      return `Passe ${jogador.passing}`;
    case 'ATA':
      return `Finalização ${jogador.shooting}`;
  }
}

// Titulares na ordem do elenco, preenchendo cada vaga do grupo na sua ordem.
function titularesDaEscalacao(
  formacao: Formacao,
  titulares: { id: number; position: Posicao }[],
): (number | null)[] {
  const vagas = vagasDa(formacao);
  return vagas.map((vaga, i) => {
    const candidatos = titulares.filter((j) =>
      vaga.posicoes.includes(j.position),
    );
    const ordem =
      vagas.slice(0, i + 1).filter((v) => v.grupo === vaga.grupo).length - 1;
    return candidatos[ordem]?.id ?? null;
  });
}

function sobrenome(nome: string): string {
  return nome.split(' ').at(-1) ?? nome;
}

function iniciais(nome: string): string {
  const partes = nome.split(' ');
  return (
    partes[0][0] + (partes.length > 1 ? partes.at(-1)![0] : '')
  ).toUpperCase();
}

const LINHAS_DO_CAMPO: Grupo[] = ['ATA', 'MEI', 'DEF', 'GOL'];
const Y_DA_LINHA: Record<Grupo, number> = {
  ATA: 18,
  MEI: 42,
  DEF: 66,
  GOL: 88,
};

function CampoPrevia({
  vagas,
  escolhidos,
  jogadores,
}: {
  vagas: Vaga[];
  escolhidos: (number | null)[];
  jogadores: JogadorDoClube[];
}) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#1f6b3a]">
      <div className="absolute inset-3 rounded-sm border-2 border-white/60" />
      <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-white/60" />
      {LINHAS_DO_CAMPO.map((linha) => {
        const indices = vagas
          .map((v, i) => ({ v, i }))
          .filter(({ v }) => v.grupo === linha);
        return indices.map(({ v, i }, ordem) => {
          const x = ((ordem + 1) / (indices.length + 1)) * 100;
          const jogador = jogadores.find((j) => j.id === escolhidos[i]);
          return (
            <div
              key={i}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
              style={{ left: `${x}%`, top: `${Y_DA_LINHA[linha]}%` }}
            >
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-full text-xs font-semibold',
                  jogador
                    ? 'bg-primary text-primary-foreground'
                    : 'border-2 border-dashed border-white/80 text-white/80',
                )}
              >
                {jogador ? iniciais(jogador.name) : '+'}
              </span>
              <span className="rounded bg-black/60 px-1.5 py-0.5 text-[11px] text-white">
                {jogador ? sobrenome(jogador.name) : v.rotulo}
              </span>
            </div>
          );
        });
      })}
    </div>
  );
}

function MiniCampo({ formacao }: { formacao: Formacao }) {
  const dados = FORMACOES.find((f) => f.valor === formacao)!;
  const linhas = [1, dados.defesa, dados.meio, dados.ataque].filter(
    (n) => n > 0,
  );
  return (
    <div className="flex size-9 shrink-0 flex-col justify-between rounded bg-[#1f6b3a] p-1">
      {linhas.map((n, i) => (
        <div key={i} className="flex justify-around">
          {Array.from({ length: n }, (_, j) => (
            <span key={j} className="size-1 rounded-full bg-white" />
          ))}
        </div>
      ))}
    </div>
  );
}

type PropsFormulario = {
  clubeId: number;
  nomeDoClube: string;
  escalacao: Escalacao;
  jogadores: JogadorDoClube[];
};

function FormularioEscalacao({
  clubeId,
  nomeDoClube,
  escalacao,
  jogadores,
}: PropsFormulario) {
  const salvar = useSalvarEscalacao(clubeId);
  const formacaoSalva = escalacao.formation ?? '2-1-1';
  const [formacao, setFormacao] = useState<Formacao>(formacaoSalva);
  const [escolhidos, setEscolhidos] = useState<(number | null)[]>(() =>
    escalacao.formation
      ? titularesDaEscalacao(formacaoSalva, escalacao.players)
      : vagasDa(formacaoSalva).map(() => null),
  );

  const vagas = vagasDa(formacao);
  const completa =
    escolhidos.length === 5 &&
    escolhidos.every((id) => id !== null) &&
    vagas.length === 5;
  const erroDaApi =
    salvar.error instanceof ErroApi ? salvar.error.message : undefined;
  const erroDeRede = salvar.error && !(salvar.error instanceof ErroApi);
  const titulares = escolhidos
    .map((id) => jogadores.find((j) => j.id === id))
    .filter((j): j is JogadorDoClube => j !== undefined);
  const malCondicionados = titulares.filter(
    (j) => j.condition === 'MAL_CONDICIONADO',
  );
  const reservas = jogadores.filter((j) => !escolhidos.includes(j.id));
  const salvaCompleta = escalacao.complete;

  const trocarFormacao = (nova: Formacao) => {
    setFormacao(nova);
    setEscolhidos(vagasDa(nova).map(() => null));
  };

  const escolher = (indice: number, valor: string) => {
    setEscolhidos((atuais) =>
      atuais.map((id, i) => (i === indice ? Number(valor) : id)),
    );
  };

  const cancelar = () => {
    setFormacao(formacaoSalva);
    setEscolhidos(
      escalacao.formation
        ? titularesDaEscalacao(formacaoSalva, escalacao.players)
        : vagasDa(formacaoSalva).map(() => null),
    );
    salvar.reset();
  };

  const enviar = () => {
    salvar.mutate(
      { formation: formacao, player_ids: escolhidos as number[] },
      { onSuccess: () => toast.success('Escalação salva') },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {!salvaCompleta && (
        <Alert
          variante="atencao"
          titulo={`Escalação incompleta: o ${nomeDoClube} não pode jogar partidas`}
        >
          O elenco tem {jogadores.length} jogadores, e a escalação precisa de 5:
          1 goleiro e 4 jogadores de linha. Compre jogadores e salve a escalação
          com os 5 titulares.
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section className="flex flex-col rounded-xl border border-border bg-card">
          <div className="flex items-start justify-between gap-3 p-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold">Titulares</h2>
              <p className="text-sm text-muted-foreground">
                1 goleiro e 4 jogadores de linha, na formação escolhida. Salvar
                troca os 5 de uma vez.
              </p>
            </div>
            {completa && salvaCompleta ? (
              <Badge variante="sucesso">
                <CircleCheck className="size-3" aria-hidden="true" />
                Completa
              </Badge>
            ) : (
              <Badge variante="atencao">
                <TriangleAlert className="size-3" aria-hidden="true" />
                Incompleta
              </Badge>
            )}
          </div>

          {(erroDaApi || erroDeRede) && (
            <div className="flex flex-col gap-3 px-4 pb-4">
              {erroDaApi && (
                <Alert variante="destrutivo" titulo="A escalação foi recusada">
                  {erroDaApi}
                </Alert>
              )}
              {erroDeRede && (
                <Alert variante="destrutivo" titulo="Sem conexão">
                  A escalação não foi salva. Verifique a conexão e tente de
                  novo.
                </Alert>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2 px-4 pb-4">
            <span className="text-sm font-medium">Formação</span>
            <p className="text-xs text-muted-foreground">
              Os números contam os jogadores de linha de trás para frente. O
              goleiro fica fora da conta.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {FORMACOES.map((f) => (
                <label
                  key={f.valor}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg border p-3',
                    formacao === f.valor
                      ? 'border-primary bg-primary-soft'
                      : 'border-border',
                  )}
                >
                  <input
                    type="radio"
                    name="formacao"
                    value={f.valor}
                    checked={formacao === f.valor}
                    onChange={() => trocarFormacao(f.valor)}
                    className="accent-primary"
                  />
                  <MiniCampo formacao={f.valor} />
                  <span className="flex flex-col">
                    <span
                      className={cn(
                        'font-medium',
                        formacao === f.valor && 'text-primary',
                      )}
                    >
                      {f.valor}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {ROTULO_FORMACAO[f.valor]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto border-t border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted-subtle text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 font-medium">Vaga</th>
                  <th className="px-4 py-2 font-medium">Titular</th>
                  <th className="px-4 py-2 font-medium">Condição</th>
                  <th className="px-4 py-2 text-right font-medium">Overall</th>
                  <th className="px-4 py-2 font-medium">Atributos usados</th>
                </tr>
              </thead>
              <tbody>
                {vagas.map((vaga, indice) => {
                  const atual = jogadores.find(
                    (j) => j.id === escolhidos[indice],
                  );
                  const opcoes = jogadores.filter(
                    (j) =>
                      vaga.posicoes.includes(j.position) &&
                      j.condition !== 'DOENTE' &&
                      (!escolhidos.includes(j.id) ||
                        j.id === escolhidos[indice]),
                  );
                  return (
                    <tr key={indice} className="border-t border-border">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{vaga.rotulo}</span>
                          <span className="text-xs text-muted-foreground">
                            {vaga.sigla}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select
                          ariaLabel={`Titular de ${vaga.rotulo} ${indice + 1}`}
                          valor={
                            escolhidos[indice] === null
                              ? ''
                              : String(escolhidos[indice])
                          }
                          aoAlterar={(valor) => escolher(indice, valor)}
                          desabilitado={opcoes.length === 0 && !atual}
                          opcoes={opcoes.map((j) => ({
                            valor: String(j.id),
                            rotulo: `${j.name} (${j.position})`,
                          }))}
                          textoTrigger={
                            atual
                              ? `${atual.name} (${atual.position})`
                              : opcoes.length === 0
                                ? vaga.grupo === 'DEF'
                                  ? 'Sem ZAG ou LAT'
                                  : `Sem ${vaga.sigla} no elenco`
                                : 'Escolha um jogador'
                          }
                          className="w-full min-w-48 justify-between"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {atual && <CondicaoBadge condicao={atual.condition} />}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {atual?.overall ?? ''}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {atual && atributosUsados(atual)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {malCondicionados.length > 0 && (
            <div className="px-4 pt-4">
              <Alert
                variante="atencao"
                titulo={`${malCondicionados.map((j) => j.name).join(' e ')} ${malCondicionados.length > 1 ? 'estão' : 'está'} mal condicionad${malCondicionados.length > 1 ? 'os' : 'o'}`}
              >
                Podem jogar, mas cada atributo vale 15% a menos durante a
                partida.
              </Alert>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              A escalação vale até ser trocada. Titular vendido ou que fica
              doente sai dela, e o clube só volta a jogar depois de escalar de
              novo.
            </p>
            <div className="flex shrink-0 gap-2">
              <Button
                variante="outline"
                onClick={cancelar}
                disabled={salvar.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={enviar}
                disabled={!completa || salvar.isPending}
                carregando={salvar.isPending}
              >
                {!salvar.isPending && <Save aria-hidden="true" />}
                {salvar.isPending ? 'Salvando…' : 'Salvar escalação'}
              </Button>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold">Em campo</h2>
              <p className="text-sm text-muted-foreground">
                Prévia da formação {formacao}, do goleiro ao ataque.
              </p>
            </div>
            <CampoPrevia
              vagas={vagas}
              escolhidos={escolhidos}
              jogadores={jogadores}
            />
            <p className="flex gap-2 text-xs text-muted-foreground">
              <ClipboardList
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              Na partida, atacam os 3 jogadores de linha mais avançados e
              defendem o goleiro e os 2 mais recuados. É gol quando o ataque é
              maior que a defesa.
            </p>
          </section>

          <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-0.5">
              <h2 className="text-base font-semibold">Reservas</h2>
              <p className="text-sm text-muted-foreground">
                Jogadores do elenco fora da escalação.
              </p>
            </div>
            {reservas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma reserva.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {reservas.map((j) => (
                  <li
                    key={j.id}
                    className="flex flex-col gap-1 rounded-lg border border-border p-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AvatarIniciais nome={j.name} chave={j.id} />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{j.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {j.position}
                          </span>
                        </div>
                      </div>
                      <CondicaoBadge condicao={j.condition} />
                    </div>
                    {j.condition === 'DOENTE' && (
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Lock className="size-3" aria-hidden="true" />
                        Doente não pode ser escalado.
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

type PropsEscalacaoClube = {
  clubeId: number;
  nomeDoClube: string;
  escalacao: Escalacao;
  jogadores: JogadorDoClube[];
};

export function EscalacaoClube({
  clubeId,
  nomeDoClube,
  escalacao,
  jogadores,
}: PropsEscalacaoClube) {
  const chave = `${escalacao.formation ?? 'nenhuma'}-${escalacao.players.map((j) => j.id).join(',')}-${jogadores.map((j) => `${j.id}${j.condition}`).join(',')}`;
  return (
    <FormularioEscalacao
      key={chave}
      clubeId={clubeId}
      nomeDoClube={nomeDoClube}
      escalacao={escalacao}
      jogadores={jogadores}
    />
  );
}
