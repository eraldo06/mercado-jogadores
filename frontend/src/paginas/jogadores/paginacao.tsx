import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Paginacao as MetaPaginacao } from '../../api/tipos';
import { Button } from '../../components/ui/button';
import { inteiro } from '../../lib/formatar';

type PropsPaginacao = {
  meta: MetaPaginacao;
  aoMudarPagina: (pagina: number) => void;
};

export function Paginacao({ meta, aoMudarPagina }: PropsPaginacao) {
  const inicio = meta.total_items === 0 ? 0 : (meta.page - 1) * meta.limit + 1;
  const fim = Math.min(meta.page * meta.limit, meta.total_items);
  const paginas = Array.from(
    { length: meta.total_pages },
    (_, indice) => indice + 1,
  );

  return (
    <nav
      aria-label="Paginação"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm"
    >
      <span className="text-muted-foreground">
        {meta.total_items === 0
          ? 'Nenhum jogador encontrado'
          : `Mostrando ${inicio}–${fim} de ${inteiro(meta.total_items)} jogadores`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variante="ghost"
          tamanho="sm"
          disabled={meta.page <= 1}
          onClick={() => aoMudarPagina(meta.page - 1)}
        >
          <ChevronLeft />
          Anterior
        </Button>
        {paginas.map((pagina) => (
          <Button
            key={pagina}
            variante={pagina === meta.page ? 'outline' : 'ghost'}
            tamanho="icone"
            aria-current={pagina === meta.page ? 'page' : undefined}
            onClick={() => aoMudarPagina(pagina)}
          >
            {pagina}
          </Button>
        ))}
        <Button
          variante="ghost"
          tamanho="sm"
          disabled={meta.page >= meta.total_pages}
          onClick={() => aoMudarPagina(meta.page + 1)}
        >
          Próxima
          <ChevronRight />
        </Button>
      </div>
    </nav>
  );
}
