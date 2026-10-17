import { cn } from '../../lib/utils';

const paletas = [
  'bg-avatar-violet text-avatar-violet-foreground',
  'bg-avatar-pink text-avatar-pink-foreground',
  'bg-avatar-cyan text-avatar-cyan-foreground',
  'bg-avatar-teal text-avatar-teal-foreground',
  'bg-avatar-zinc text-avatar-zinc-foreground',
];

function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toLocaleUpperCase('pt-BR'))
    .join('');
}

type PropsAvatarIniciais = {
  nome: string;
  chave: number;
  className?: string;
};

export function AvatarIniciais({
  nome,
  chave,
  className,
}: PropsAvatarIniciais) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium',
        paletas[chave % paletas.length],
        className,
      )}
    >
      {iniciais(nome)}
    </span>
  );
}
