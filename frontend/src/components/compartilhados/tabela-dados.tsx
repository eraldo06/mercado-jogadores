import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Skeleton } from '../ui/skeleton';
import { EstadoErro } from './estado-erro';
import { EstadoVazio } from './estado-vazio';

export type ColunaTabela<T> = {
  chave: string;
  titulo: string;
  alinhamento?: 'esquerda' | 'direita' | 'centro';
  className?: string;
  render: (linha: T) => ReactNode;
};

export type EstadoTabela = 'carregando' | 'pronto' | 'erro';

type PropsTabelaDados<T> = {
  colunas: ColunaTabela<T>[];
  linhas: T[];
  chaveLinha: (linha: T) => string | number;
  estado: EstadoTabela;
  vazio: {
    icone: LucideIcon;
    titulo: string;
    descricao?: string;
    acao?: ReactNode;
  };
  tituloErro?: string;
  mensagemErro?: string;
  aoTentarNovamente?: () => void;
  quantidadeEsqueleto?: number;
  rodape?: ReactNode;
  cabecalho?: ReactNode;
};

const alinhamentoClasse = {
  esquerda: 'text-left',
  direita: 'text-right',
  centro: 'text-center',
} as const;

export function TabelaDados<T>({
  colunas,
  linhas,
  chaveLinha,
  estado,
  vazio,
  tituloErro = 'Não foi possível carregar os dados',
  mensagemErro = 'Não foi possível carregar os dados. Tente de novo.',
  aoTentarNovamente,
  quantidadeEsqueleto = 6,
  rodape,
  cabecalho,
}: PropsTabelaDados<T>) {
  const semLinhas = estado === 'pronto' && linhas.length === 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      {cabecalho && (
        <div className="border-b border-border px-4 py-3">{cabecalho}</div>
      )}

      {estado === 'erro' && (
        <EstadoErro
          titulo={tituloErro}
          descricao={mensagemErro}
          aoTentarNovamente={aoTentarNovamente}
        />
      )}

      {estado !== 'erro' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted-subtle text-muted-foreground">
              <tr className="border-b border-border">
                {colunas.map((coluna) => (
                  <th
                    key={coluna.chave}
                    scope="col"
                    className={cn(
                      'h-10 px-3 font-medium whitespace-nowrap',
                      alinhamentoClasse[coluna.alinhamento ?? 'esquerda'],
                      coluna.className,
                    )}
                  >
                    {coluna.titulo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {estado === 'carregando' &&
                Array.from({ length: quantidadeEsqueleto }, (_, indice) => (
                  <tr
                    key={indice}
                    className="border-b border-border last:border-0"
                  >
                    {colunas.map((coluna) => (
                      <td key={coluna.chave} className="px-3 py-3">
                        <Skeleton className="h-4 w-full max-w-[8rem]" />
                      </td>
                    ))}
                  </tr>
                ))}

              {estado === 'pronto' &&
                linhas.map((linha) => (
                  <tr
                    key={chaveLinha(linha)}
                    className="border-b border-border last:border-0 hover:bg-muted-subtle"
                  >
                    {colunas.map((coluna) => (
                      <td
                        key={coluna.chave}
                        className={cn(
                          'px-3 py-3',
                          alinhamentoClasse[coluna.alinhamento ?? 'esquerda'],
                          coluna.className,
                        )}
                      >
                        {coluna.render(linha)}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>

          {semLinhas && (
            <EstadoVazio
              icone={vazio.icone}
              titulo={vazio.titulo}
              descricao={vazio.descricao}
              acao={vazio.acao}
            />
          )}
        </div>
      )}

      {rodape}
    </div>
  );
}
