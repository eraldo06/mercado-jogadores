import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

const CONSULTA_MOBILE = '(max-width: 639px)';

export function Toaster() {
  const [mobile, setMobile] = useState(
    () => window.matchMedia(CONSULTA_MOBILE).matches,
  );

  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA_MOBILE);
    const aoMudar = (evento: MediaQueryListEvent) => setMobile(evento.matches);
    consulta.addEventListener('change', aoMudar);
    return () => consulta.removeEventListener('change', aoMudar);
  }, []);

  return (
    <SonnerToaster
      position={mobile ? 'bottom-center' : 'bottom-right'}
      closeButton
      icons={{
        success: (
          <CircleCheck className="size-4 text-success" aria-hidden="true" />
        ),
        error: (
          <CircleAlert className="size-4 text-destructive" aria-hidden="true" />
        ),
        close: <X className="size-4" aria-hidden="true" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'w-[356px] max-w-[calc(100vw-2rem)] items-start gap-3 rounded-[10px] border border-border bg-background p-4 pr-10 text-foreground shadow-lg',
          title: 'text-sm font-medium text-foreground',
          description: 'text-sm text-muted-foreground',
          closeButton:
            'top-4! right-4! left-auto! h-4! w-4! translate-none! transform-none! rounded-none! border-0! bg-transparent! p-0 text-muted-foreground hover:text-foreground',
        },
      }}
    />
  );
}
