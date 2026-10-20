import { ArrowLeft, ArrowRight, HeartPulse } from 'lucide-react';
import type { PartidaDetalhe } from '../../api/liga';
import { cn } from '../../lib/utils';
import { jogadoresNoCampo, posicionarNoCampo } from './campo-partida-dados';

const ESTILO_GRAMADO = {
  backgroundColor: '#0D542B',
  backgroundImage:
    'repeating-linear-gradient(to right, transparent 0 6.64%, rgba(255, 255, 255, 0.05) 6.64% 13.3%)',
};

function iniciais(nome: string): string {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toLocaleUpperCase('pt-BR');
}

function sobrenome(nome: string): string {
  const partes = nome.split(' ').filter(Boolean);
  return partes[partes.length - 1] ?? nome;
}

export function BolaGol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden="true">
      <circle cx="8" cy="8" r="7.5" fill="#FFFFFF" stroke="#09090B" />
      <polygon
        points="8,4.8 11.04,7.01 9.88,10.59 6.12,10.59 4.96,7.01"
        fill="#09090B"
      />
    </svg>
  );
}

export function LegendaCampo() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="flex size-4 items-center justify-center rounded-full bg-[#B55200] text-white">
          <HeartPulse className="size-2.5" aria-hidden="true" />
        </span>
        Mal condicionado
      </span>
      <span className="flex items-center gap-1.5">
        <BolaGol className="size-4" />
        Gol no duelo
      </span>
    </div>
  );
}

function Marcacoes() {
  return (
    <>
      <div className="absolute inset-x-[2.24%] inset-y-[5.45%] border-[1.5px] border-white/40" />
      <div className="absolute top-[5.45%] bottom-[5.45%] left-1/2 w-[1.5px] bg-white/40" />
      <div className="absolute top-1/2 left-1/2 aspect-square w-[9.86%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-white/40" />
      <div className="absolute top-1/2 left-1/2 size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />

      <div className="absolute top-[23.59%] left-[2.24%] h-[52.83%] w-[8.89%] border-[1.5px] border-white/40" />
      <div className="absolute top-[23.59%] right-[2.24%] h-[52.83%] w-[8.89%] border-[1.5px] border-white/40" />
      <div className="absolute top-[38%] left-[2.24%] h-[24%] w-[2.96%] border-[1.5px] border-white/40" />
      <div className="absolute top-[38%] right-[2.24%] h-[24%] w-[2.96%] border-[1.5px] border-white/40" />
      <div className="absolute top-[49.5%] left-[7.98%] size-1 rounded-full bg-white/40" />
      <div className="absolute top-[49.5%] right-[7.98%] size-1 rounded-full bg-white/40" />
      <div className="absolute top-[40.4%] left-[11.13%] h-[19.2%] w-[1.97%] rounded-r-full border-[1.5px] border-l-0 border-white/40" />
      <div className="absolute top-[40.4%] right-[11.13%] h-[19.2%] w-[1.97%] rounded-l-full border-[1.5px] border-r-0 border-white/40" />

      <div className="absolute top-[45.2%] left-[1.17%] h-[9.6%] w-[1.08%] border-[1.5px] border-white/40 bg-white/5" />
      <div className="absolute top-[45.2%] right-[1.17%] h-[9.6%] w-[1.08%] border-[1.5px] border-white/40 bg-white/5" />
    </>
  );
}

type PropsCampoPartida = {
  partida: PartidaDetalhe;
};

export function CampoPartida({ partida }: PropsCampoPartida) {
  const posicoes = posicionarNoCampo(jogadoresNoCampo(partida));

  return (
    <section className="flex flex-col gap-0 rounded-xl border border-border bg-card shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold tracking-[-0.01em]">
            Em campo
          </h2>
          <p className="text-xs text-muted-foreground">
            Titulares de cada clube na formação da partida e os valores usados
            nos duelos, já com o efeito da condição.
          </p>
        </div>
        <LegendaCampo />
      </div>

      <div className="p-5">
        <div
          aria-hidden="true"
          className="relative aspect-[1070/440] w-full overflow-hidden rounded-xl"
          style={ESTILO_GRAMADO}
        >
          <Marcacoes />

          <span className="absolute top-[8.2%] left-[3.4%] flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-xs text-white">
            <span className="size-2.5 rounded-full bg-primary" />
            <span className="font-medium">{partida.home.club_name}</span>
            <span className="text-white/80">{partida.home.formation}</span>
            <span className="h-3 w-px bg-white/40" />
            <span className="flex items-center gap-1 text-white/80">
              ataca
              <ArrowRight className="size-3" aria-hidden="true" />
            </span>
          </span>
          <span className="absolute top-[8.2%] right-[3.4%] flex items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1 text-xs text-white">
            <span className="flex items-center gap-1 text-white/80">
              <ArrowLeft className="size-3" aria-hidden="true" />
              ataca
            </span>
            <span className="h-3 w-px bg-white/40" />
            <span className="text-white/80">{partida.away.formation}</span>
            <span className="font-medium">{partida.away.club_name}</span>
            <span className="size-2.5 rounded-full bg-white" />
          </span>

          {posicoes.map(({ jogador, x, y }) => {
            const usos = [
              jogador.ataque &&
                `${jogador.ataque.sigla} ${jogador.ataque.valor}`,
              jogador.defesa !== null && `Def ${jogador.defesa}`,
            ].filter(Boolean);
            return (
              <div
                key={jogador.id}
                className="absolute flex -translate-x-1/2 -translate-y-[18px] flex-col items-center gap-2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <span
                  className={cn(
                    'relative flex size-9 items-center justify-center rounded-full border-2 border-white text-xs font-medium shadow-md',
                    jogador.mandante
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white text-[#09090B]',
                  )}
                >
                  {iniciais(jogador.nome)}
                  {jogador.condicao === 'MAL_CONDICIONADO' && (
                    <span className="absolute -top-1.5 -left-1.5 flex size-[18px] items-center justify-center rounded-full border-[1.5px] border-white bg-[#B55200] text-white">
                      <HeartPulse className="size-[11px]" aria-hidden="true" />
                    </span>
                  )}
                  {jogador.gol && (
                    <BolaGol className="absolute -top-1.5 -right-1.5 size-[18px] drop-shadow-sm" />
                  )}
                </span>
                <span className="flex flex-col items-center gap-0.5">
                  <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-white">
                    {sobrenome(jogador.nome)}
                  </span>
                  <span className="text-xs whitespace-nowrap text-white/80 tabular-nums">
                    {[jogador.posicao, ...usos].join(' · ')}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
