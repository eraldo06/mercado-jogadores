import * as MenuPrimitivo from '@radix-ui/react-dropdown-menu';
import {
  EllipsisVertical,
  HeartPulse,
  Pencil,
  ShoppingCart,
  Trash2,
} from 'lucide-react';
import type { Jogador } from '../../api/jogadores';
import { cn } from '../../lib/utils';

type PropsMenuAcoes = {
  jogador: Jogador;
  aoEditar: (jogador: Jogador) => void;
  aoAlterarCondicao: (jogador: Jogador) => void;
  aoComprar: (jogador: Jogador) => void;
  aoExcluir: (jogador: Jogador) => void;
};

export function MenuAcoesJogador({
  jogador,
  aoEditar,
  aoAlterarCondicao,
  aoComprar,
  aoExcluir,
}: PropsMenuAcoes) {
  const livre = jogador.club_id === null;
  const itemClasse =
    'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground';
  return (
    <MenuPrimitivo.Root>
      <MenuPrimitivo.Trigger
        aria-label={`Ações de ${jogador.name}`}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <EllipsisVertical className="size-4" />
      </MenuPrimitivo.Trigger>
      <MenuPrimitivo.Portal>
        <MenuPrimitivo.Content
          align="end"
          sideOffset={4}
          className={cn(
            'z-50 min-w-48 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md',
          )}
        >
          <MenuPrimitivo.Label className="px-2 py-1.5 text-xs text-muted-foreground">
            {jogador.name}
          </MenuPrimitivo.Label>
          <MenuPrimitivo.Item
            className={itemClasse}
            onSelect={() => aoEditar(jogador)}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </MenuPrimitivo.Item>
          <MenuPrimitivo.Item
            className={itemClasse}
            onSelect={() => aoAlterarCondicao(jogador)}
          >
            <HeartPulse className="size-4" aria-hidden="true" />
            Alterar condição
          </MenuPrimitivo.Item>
          <MenuPrimitivo.Item
            className={cn(itemClasse, 'data-[disabled]:opacity-50')}
            disabled={!livre}
            onSelect={() => aoComprar(jogador)}
          >
            <ShoppingCart className="size-4" aria-hidden="true" />
            Comprar
          </MenuPrimitivo.Item>
          <MenuPrimitivo.Separator className="-mx-1 my-1 h-px bg-border" />
          <MenuPrimitivo.Item
            className={cn(
              itemClasse,
              'flex-wrap text-destructive data-[disabled]:opacity-50',
            )}
            disabled={!livre}
            onSelect={() => aoExcluir(jogador)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Excluir
            <span className="w-full pl-6 text-xs text-muted-foreground">
              {livre
                ? 'Disponível porque o jogador está livre.'
                : 'Indisponível: o jogador está num clube.'}
            </span>
          </MenuPrimitivo.Item>
        </MenuPrimitivo.Content>
      </MenuPrimitivo.Portal>
    </MenuPrimitivo.Root>
  );
}
