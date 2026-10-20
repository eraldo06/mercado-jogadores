# Frontend — Passe

Interface do sistema Passe (mercado de jogadores), em React com TypeScript, criada com Vite. Consome a API NestJS do diretório `backend/`. O README da raiz traz a visão geral do projeto e o banco de dados.

## 1. Pré-requisitos

Ubuntu 24.04 com as ferramentas abaixo:

| Ferramenta     | Versão                                      | Observação                                                           |
| -------------- | ------------------------------------------- | -------------------------------------------------------------------- |
| Node.js        | 22.12 ou mais recente (testado com 22.23.3) | O Vite 8 exige 22.12. Instale com nvm, o gerenciador oficial do Node |
| npm            | 10 (testado com 10.9.0)                     | Vem com o Node.js                                                    |
| Backend da API | em execução em `http://localhost:3000`      | Veja o item 3 do README da raiz. O frontend não sobe sem a API       |

Docker não é necessário para rodar o frontend em modo de desenvolvimento.

## 2. Origem da API e URL do frontend

- Origem da API (sem `/api/v1`, que o cliente acrescenta): `http://localhost:3000`
- URL do frontend em desenvolvimento: `http://localhost:5173`

## 3. Instalar e executar

Todos os comandos rodam na pasta `frontend`, a partir da raiz do repositório:

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

Abra `http://localhost:5173` no navegador. A tela inicial é a de jogadores; a página de apresentação fica em `/inicio`, clicando no logo Passe no topo do menu.

Para gerar o build de produção (verificação de tipos e pacote em `dist/`):

```bash
cd frontend
npm ci
npm run build
npm run preview
```

`npm run preview` serve o build em `http://localhost:4173`.

Os arquivos de trava `package-lock.json` estão versionados. Use sempre `npm ci`, que instala exatamente as versões travadas.

O `.npmrc` define `legacy-peer-deps=true`, herdado do esqueleto do projeto. A árvore de dependências resolve sem essa flag (conferido com `npm ls`), então ela pode ser removida se preferir.

### Testes e qualidade

Na pasta `frontend`, depois do `npm ci`:

```bash
npm test              # testes com Vitest e Testing Library (termina sozinho)
npm run lint          # ESLint
npm run format:check  # Prettier, só verifica
npm run build         # verificação de tipos e build
```

Os testes ficam ao lado do código que testam (`*.test.ts` e `*.test.tsx`) e cobrem as regras de validação, a formatação de moeda e data, o envio único e componentes de compra e multa.

## 4. Variáveis de ambiente

Arquivo de exemplo: `.env.example`. Copie para `.env` com `cp .env.example .env`.

| Variável       | Exemplo                 | Para que serve                                                                                 |
| -------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `VITE_API_URL` | `http://localhost:3000` | Origem da API. O Vite grava esse valor no build, então, se mudar, rode `npm run build` de novo |

Sem `.env`, o frontend usa `http://localhost:3000` como padrão.

## 5. Estrutura de pastas e bibliotecas

```text
frontend/
├── index.html                 página base do Vite
├── vite.config.ts             configuração do Vite, Tailwind e Vitest
├── src/
│   ├── main.tsx               inicialização: React Query, roteador e fonte
│   ├── App.tsx                rotas da aplicação
│   ├── api/                   cliente HTTP e funções por recurso, com tipos
│   ├── consultas/             hooks do TanStack Query (leitura e envio)
│   ├── components/
│   │   ├── compartilhados/    tabela, estados, cabeçalho, diálogos de confirmação
│   │   └── ui/                componentes base (botão, campo, diálogo, select)
│   ├── lib/                   formatação de moeda e data, validação de moeda, envio único
│   ├── paginas/
│   │   ├── jogadores/         lista, cadastro, edição, condição, compra
│   │   ├── clubes/            lista, criação, página do clube (elenco, escalação, histórico), venda
│   │   └── liga/              partidas, detalhe da partida, classificação
│   └── test/                  arquivo de setup dos testes
└── public/                    arquivos estáticos
```

Bibliotecas de execução:

| Biblioteca                                                                 | Motivo                                                                                             |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `react`, `react-dom` (19)                                                  | Interface (stack obrigatória: React 18 ou superior)                                                |
| `react-router` (7, modo biblioteca)                                        | Rotas e navegação entre telas (stack obrigatória)                                                  |
| `@tanstack/react-query`                                                    | Estado de leitura da API: carregamento, erro e atualização depois de cada ação (stack obrigatória) |
| `zod`                                                                      | Validação dos formulários antes do envio, com mensagem junto ao campo (stack obrigatória)          |
| `@radix-ui/react-dialog`, `-select`, `-popover`, `-dropdown-menu`, `-slot` | Componentes acessíveis sem estilo próprio (diálogos, listas de seleção, menus, filtros)            |
| `sonner`                                                                   | Avisos de sucesso ("Escalação salva", "CSV baixado")                                               |
| `lucide-react`                                                             | Ícones                                                                                             |
| `class-variance-authority`, `clsx`, `tailwind-merge`                       | Variantes de componentes e junção de classes sem conflito                                          |
| `tailwindcss` (4) e `@tailwindcss/vite`                                    | Estilo utilitário, com tokens de cor, fonte e raio em `src/index.css`                              |
| `@fontsource-variable/geist`                                               | Fonte da interface, importada em `src/index.css` e servida pelo próprio projeto                    |

Bibliotecas de desenvolvimento:

| Biblioteca                                                                                                         | Motivo                                                            |
| ------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `vite` (8) e `@vitejs/plugin-react`                                                                                | Servidor de desenvolvimento e build (template `react-ts` do Vite) |
| `typescript` (6)                                                                                                   | Tipos em todo o código                                            |
| `eslint`, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `@eslint/js` | Lint (diferencial)                                                |
| `prettier`, `eslint-config-prettier`                                                                               | Formatação e verificação (diferencial)                            |
| `vitest`, `jsdom`                                                                                                  | Testes e ambiente de navegador simulado (diferencial)             |
| `@testing-library/react`, `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/user-event`       | Testes de componente e interação (diferencial)                    |

## 6. Decisões do frontend

- **Moeda e data:** valores em moedas com 2 casas e vírgula decimal. Datas são enviadas no formato da API (`AAAA-MM-DDTHH:MM-03:00`) e mostradas no horário de Brasília.
- **Envio único:** cada ação é enviada uma vez. O botão fica desabilitado durante o envio, e um segundo clique enquanto o primeiro está em curso é ignorado.
- **Atualização sem recarregar:** depois de cada ação, as listas relacionadas são invalidadas e buscadas de novo na API. Nenhum valor é recalculado na tela, exceto a soma de valor e taxa para mostrar o custo total da compra.
- **Mensagens de erro:** toda recusa mostra o `message` devolvido pela API.
- **Escalação:** o botão "Salvar escalação" fica desabilitado enquanto a escalação não tem os 5 titulares, e a validação com Zod impede o envio de qualquer forma.
- **Responsividade:** em 375 px o menu lateral vira um painel aberto pelo botão de menu. As tabelas rolam dentro do próprio quadro, e a página não tem rolagem horizontal.

## 7. Funcionalidades não implementadas

Nenhuma no frontend. Todas as telas do enunciado estão implementadas. A prévia "Em campo" da partida (foto 64 do mockup) usa só os dados dos 6 duelos devolvidos pela API, sem recalcular nada.
