import { Wallet } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { ErroApi } from '../../api/cliente';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { Campo } from '../../components/ui/campo';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import type { ErrosFormulario } from '../jogadores/validacao-jogador';
import { validarClube } from './validacao-clube';

type PropsFormularioClube = {
  aoFechar: () => void;
  carregando: boolean;
  erroApi: unknown;
  aoSalvar: (dados: { name: string; acronym: string }) => void;
};

function mensagemDeErro(erro: unknown): string | undefined {
  if (erro === null || erro === undefined) return undefined;
  if (erro instanceof ErroApi) return erro.message;
  return 'Não foi possível criar o clube. Verifique a conexão e tente de novo.';
}

export function FormularioClube({
  aoFechar,
  carregando,
  erroApi,
  aoSalvar,
}: PropsFormularioClube) {
  const [nome, setNome] = useState('');
  const [sigla, setSigla] = useState('');
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const erroDaApi = mensagemDeErro(erroApi);

  const enviar = (evento: FormEvent) => {
    evento.preventDefault();
    setTentouEnviar(true);
    const { dados, erros: novos } = validarClube({ nome, sigla });
    setErros(novos);
    if (dados) aoSalvar({ name: dados.nome, acronym: dados.sigla });
  };

  const revalidar = (novoNome: string, novaSigla: string) => {
    if (tentouEnviar)
      setErros(validarClube({ nome: novoNome, sigla: novaSigla }).erros);
  };

  return (
    <Dialog
      aberto
      aoAlterarAbertura={(aberto) => !aberto && aoFechar()}
      titulo="Novo clube"
      descricao="Informe o nome e a sigla do clube."
      rodape={
        <>
          <Button variante="outline" onClick={aoFechar} disabled={carregando}>
            Cancelar
          </Button>
          <Button type="submit" form="formulario-clube" carregando={carregando}>
            Criar clube
          </Button>
        </>
      }
    >
      <form
        id="formulario-clube"
        onSubmit={enviar}
        noValidate
        className="flex flex-col gap-5"
      >
        {erroDaApi && (
          <Alert variante="destrutivo" titulo="Não foi possível criar o clube">
            {erroDaApi}
          </Alert>
        )}

        <Campo
          id="clube-nome"
          rotulo="Nome"
          erro={erros.nome}
          ajuda={
            erros.nome
              ? undefined
              : 'De 3 a 60 caracteres e de 2 a 5 palavras; só letras, espaços, hífen e ponto. Não pode repetir outro clube.'
          }
        >
          <Input
            id="clube-nome"
            value={nome}
            onChange={(evento) => {
              setNome(evento.target.value);
              revalidar(evento.target.value, sigla);
            }}
            aria-invalid={erros.nome ? true : undefined}
          />
        </Campo>

        <Campo
          id="clube-sigla"
          rotulo="Sigla"
          erro={erros.sigla}
          ajuda={
            erros.sigla
              ? undefined
              : '3 letras de A a Z, maiúsculas, que aparecem no nome nessa ordem; a primeira é a primeira letra do nome.'
          }
        >
          <Input
            id="clube-sigla"
            maxLength={3}
            value={sigla}
            onChange={(evento) => {
              setSigla(evento.target.value.toUpperCase());
              revalidar(nome, evento.target.value.toUpperCase());
            }}
            aria-invalid={erros.sigla ? true : undefined}
          />
        </Campo>

        <div className="flex items-center gap-3 rounded-md border border-dashed border-border bg-muted-subtle p-3 text-sm text-muted-foreground">
          <Wallet className="size-4 shrink-0" aria-hidden="true" />O clube
          começa com 300,00 em caixa e sem jogadores.
        </div>
      </form>
    </Dialog>
  );
}
