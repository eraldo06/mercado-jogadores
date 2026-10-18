import { Info, Shield, Swords } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ErroApi } from '../../api/cliente';
import type { ClubeResumo } from '../../api/clubes';
import type { NovaPartida } from '../../api/liga';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Select } from '../../components/ui/select';

type PropsDialogNovaPartida = {
  clubes: ClubeResumo[];
  carregando: boolean;
  erroApi: unknown;
  aoFechar: () => void;
  aoSalvar: (dados: NovaPartida) => void;
};

export function DialogNovaPartida({
  clubes,
  carregando,
  erroApi,
  aoFechar,
  aoSalvar,
}: PropsDialogNovaPartida) {
  const [mandante, setMandante] = useState('');
  const [visitante, setVisitante] = useState('');
  const [erroLocal, setErroLocal] = useState<string | undefined>();

  const erroDaApi = erroApi instanceof ErroApi ? erroApi.message : undefined;
  const erroDeRede = Boolean(erroApi) && !(erroApi instanceof ErroApi);
  const nomeDe = (id: string) => clubes.find((c) => String(c.id) === id);
  const opcoes = clubes.map((clube) => ({
    valor: String(clube.id),
    rotulo: `${clube.name} (${clube.acronym})`,
  }));

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    if (!mandante || !visitante) {
      setErroLocal('Escolha o mandante e o visitante.');
      return;
    }
    if (mandante === visitante) {
      setErroLocal('Precisa ser um clube diferente do mandante.');
      return;
    }
    setErroLocal(undefined);
    aoSalvar({
      home_club_id: Number(mandante),
      away_club_id: Number(visitante),
    });
  };

  return (
    <Dialog
      aberto
      largura="lg"
      aoAlterarAbertura={(aberto) => !aberto && aoFechar()}
      titulo="Nova partida"
      descricao="Escolha o mandante e o visitante. O placar sai dos atributos dos titulares, sem sorteio."
      rodape={
        <>
          <Button variante="outline" onClick={aoFechar} disabled={carregando}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="formulario-partida"
            carregando={carregando}
            disabled={carregando}
          >
            {!carregando && <Swords aria-hidden="true" />}
            {carregando ? 'Jogando…' : 'Jogar partida'}
          </Button>
        </>
      }
    >
      <form
        id="formulario-partida"
        onSubmit={enviar}
        noValidate
        className="flex flex-col gap-4"
      >
        {erroDaApi && (
          <Alert
            variante="destrutivo"
            titulo="Não foi possível jogar a partida"
          >
            {erroDaApi}
          </Alert>
        )}
        {erroDeRede && (
          <Alert variante="destrutivo" titulo="Sem conexão">
            A partida não foi jogada. Verifique a conexão e tente de novo.
          </Alert>
        )}

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium">Mandante</legend>
          <Select
            ariaLabel="Mandante"
            valor={mandante}
            aoAlterar={setMandante}
            opcoes={opcoes}
            textoTrigger={
              <span className="flex items-center gap-2">
                <Shield
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {nomeDe(mandante)
                  ? `${nomeDe(mandante)!.name} (${nomeDe(mandante)!.acronym})`
                  : 'Escolha um clube'}
              </span>
            }
            className="w-full justify-between pl-4"
          />
          <p className="text-xs text-muted-foreground">
            Faz os 3 primeiros ataques.
          </p>
        </fieldset>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 text-sm font-medium">Visitante</legend>
          <Select
            ariaLabel="Visitante"
            valor={visitante}
            aoAlterar={setVisitante}
            opcoes={opcoes}
            textoTrigger={
              <span className="flex items-center gap-2">
                <Shield
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                {nomeDe(visitante)
                  ? `${nomeDe(visitante)!.name} (${nomeDe(visitante)!.acronym})`
                  : 'Escolha um clube'}
              </span>
            }
            className="w-full justify-between pl-4"
          />
          {erroLocal ? (
            <p className="text-xs text-destructive-soft-foreground">
              {erroLocal}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Precisa ser um clube diferente do mandante.
            </p>
          )}
        </fieldset>

        <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted-subtle p-3 text-sm">
          <span className="flex items-center gap-2 font-medium">
            <Info className="size-4" aria-hidden="true" />
            Como sai o placar
          </span>
          <p className="text-xs text-muted-foreground">
            Cada time faz 3 ataques. Pela ordem do elenco, os jogadores de linha
            vão do 1º (o mais recuado) ao 4º (o mais avançado): o 4º enfrenta o
            goleiro, o 3º enfrenta o 1º e o 2º enfrenta o 2º do adversário. O
            atacante usa finalização (ATA), passe (MEI) ou drible (ZAG e LAT), e
            quem defende usa defesa. É gol só quando o ataque é maior; mal
            condicionado joga com 15% a menos.
          </p>
          <p className="text-xs text-muted-foreground">
            Os dois clubes precisam ter os 5 titulares escalados. A partida não
            mexe no caixa.
          </p>
        </div>
      </form>
    </Dialog>
  );
}
