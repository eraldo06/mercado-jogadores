import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import App from './App';
import { ErroApi } from './api/cliente';
import './index.css';

const clienteConsultas = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (tentativas, erro) =>
        !(erro instanceof ErroApi && erro.status >= 400 && erro.status < 500) &&
        tentativas < 2,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
