# Mercado de Jogadores

Sistema "Passe": mercado de jogadores de uma liga de futebol fictícia. Clubes compram e vendem jogadores com contrato de fidelidade, escalam titulares e jogam partidas. O backend é uma API REST em NestJS com PostgreSQL. O frontend (React, em construção) consome essa API.

## Pré-requisitos

Ubuntu 24.04 com as ferramentas abaixo.

- **Node.js 22 LTS** com npm, versão **22.12 ou mais recente** (o Vite 8 exige 22.12). Testado com Node.js 22.23.3 e npm 10.9.
- **Docker Engine** com **Docker Compose v2** (`docker compose`), usável sem `sudo`.
- **PostgreSQL 16**: não precisa instalar; sobe pelo Docker Compose (`postgres:16-alpine`).

## Criar e recriar o banco de dados

Os comandos abaixo rodam a partir da raiz do repositório, salvo quando indicado.

Criar o banco pela primeira vez:

```bash
docker compose up -d db
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
```

O banco criado começa vazio: sem jogadores, clubes, transações ou partidas. Não há dados de exemplo.

Recriar o banco do zero (apaga todos os dados e aplica as migrations de novo), a partir da pasta `backend`:

```bash
npx prisma migrate reset --force
```

As migrations ficam em `backend/prisma/migrations`.

## Instalar e executar

### Banco de dados

```bash
docker compose up -d db
```

O banco fica em `localhost:5432` (usuário, senha e banco `mercado`).

### Backend

Na pasta `backend`, depois de criar o banco:

```bash
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run start:dev
```

A API responde em **http://localhost:3000**. Todas as rotas começam com `/api/v1`, e a origem da API para a banca é `http://localhost:3000`. A documentação interativa (Swagger) fica em http://localhost:3000/api/docs.

### Frontend

> Em construção. Os comandos (`npm ci`, `npm run dev`) e a URL da interface, `http://localhost:5173`, serão preenchidos quando o frontend estiver pronto.

### Testes e qualidade (backend)

Na pasta `backend`:

```bash
npm test              # testes unitários das regras de negócio
npm run lint          # ESLint
npm run format:check  # Prettier, só verifica
npm run build         # compilação
```

Os testes de ponta a ponta (`npm run test:e2e`) usam um banco separado, `mercado_teste`, no mesmo PostgreSQL. Para criá-lo e aplicar as migrations, a partir da raiz:

```bash
docker compose exec db psql -U mercado -d mercado -c "CREATE DATABASE mercado_teste;"
cd backend
DATABASE_URL="postgresql://mercado:mercado@localhost:5432/mercado_teste?schema=public" npx prisma migrate deploy
npm run test:e2e
```

## Variáveis de ambiente

Variáveis do backend, em `backend/.env.example`. Copie para `backend/.env` com `cp .env.example .env` e não altere os valores para rodar localmente.

| Variável | Exemplo | Para que serve |
| --- | --- | --- |
| `PORT` | `3000` | Porta em que a API escuta |
| `CORS_ORIGIN` | `http://localhost:5173` | Única origem do frontend liberada pelo CORS |
| `DATABASE_URL` | `postgresql://mercado:mercado@localhost:5432/mercado?schema=public` | Conexão com o PostgreSQL |

O `.env` não vai para o repositório (está no `.gitignore`). O `docker-compose.yml` não precisa de variáveis: as credenciais do banco de desenvolvimento estão nele.

## Estrutura de pastas e bibliotecas

```text
mercado-jogadores/
├── README.md
├── docker-compose.yml        banco PostgreSQL 16
├── backend/                  API NestJS
│   ├── prisma/               schema e migrations
│   ├── src/
│   │   ├── domain/           regras de negócio como funções puras (sem banco)
│   │   ├── common/           pipes, filtro de erros e validadores reutilizados
│   │   ├── players/          jogadores (cadastro, listagem, edição, condição, exclusão)
│   │   ├── clubs/            clubes (criação, listagem, consulta com elenco)
│   │   ├── market/           compra, venda, histórico e exportação CSV
│   │   ├── league/           escalação, partidas e classificação
│   │   ├── prisma/           acesso ao banco
│   │   ├── app.module.ts     módulos da aplicação
│   │   ├── app.setup.ts      configuração comum (prefixo, CORS, validação, erros)
│   │   └── main.ts           inicialização e Swagger
│   └── test/                 testes de ponta a ponta
└── frontend/                 interface React (em construção)
```

Bibliotecas do backend:

| Biblioteca | Motivo |
| --- | --- |
| `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express` | Framework da API (stack obrigatória) |
| `@prisma/client`, `prisma` | ORM e migrations sobre PostgreSQL (stack obrigatória) |
| `class-validator`, `class-transformer` | Validação declarativa dos DTOs |
| `@nestjs/config` | Leitura das variáveis de ambiente |
| `@nestjs/swagger` | Documentação interativa da API em `/api/docs` |
| `reflect-metadata`, `rxjs` | Dependências exigidas pelo NestJS |
| `jest`, `ts-jest`, `@nestjs/testing`, `supertest` | Testes unitários e de ponta a ponta |
| `eslint`, `typescript-eslint`, `prettier` | Lint e formatação |
| `typescript`, `ts-node`, `tsconfig-paths`, `@nestjs/cli` | Compilação e execução em TypeScript |

## Decisões e premissas

- **Moedas:** calculadas com `Decimal` (sem ponto flutuante) e arredondadas uma vez, no resultado final, para 2 casas, com meio para longe do zero. No banco, valores em moeda são `DECIMAL`.
- **Valor base:** calculado uma vez, no cadastro, e gravado. O valor de mercado e o overall são calculados a cada consulta e nunca gravados.
- **Exclusão de jogador:** lógica (`excluido_em`). Jogador excluído responde `404` em todos os endpoints e some da listagem. Transações e partidas antigas mantêm o nome gravado.
- **Corpo das requisições:** deve ser um objeto JSON. Em consultas, exclusão e venda, o corpo enviado é ignorado (V1). Campos que o sistema calcula, ou que não pertencem ao endpoint, são ignorados sem erro (V7).
- **Erros:** toda recusa devolve JSON com `message` e não grava nada. Erro inesperado devolve `500` com mensagem genérica e registra o detalhe no log, sem stack trace na resposta.
- **Identificadores na URL:** id fora do formato (não inteiro positivo, com zero à esquerda ou acima de 2.147.483.647) responde `404`, como recurso inexistente.
- **Datas:** entrada no formato `AAAA-MM-DDTHH:MM-03:00`, com data e hora conferidas (ex.: 30 de fevereiro é recusado). Saída em `AAAA-MM-DDTHH:MM:SS-03:00`.
- **Texto:** espaços das pontas são removidos e espaços repetidos viram um. Caracteres de controle são recusados. Nome de clube é único sem diferenciar maiúsculas, mas com acento. A sigla também é única.
- **Escalação:** a formação fica salva no clube (coluna `clubes.formacao`, adicional ao enunciado). Titular que é vendido ou passa a `DOENTE` sai da escalação, e o clube só volta a jogar quando escala de novo.
- **Ordenação com dois critérios:** `sort` aceita até dois valores separados por vírgula. Repetir o mesmo campo recusa com `400` (ex.: `name,name`). A combinação de direções opostas do mesmo campo (`value_asc,value_desc`) é aceita.
- **Partidas:** os 6 duelos são gravados com nomes, posições, condições e valores do momento. Editar ou vender um jogador não muda partidas passadas.
- **Migrations:** o banco é criado só pelas migrations versionadas; não há script de dados de exemplo.
- **CORS:** liberado somente para a origem em `CORS_ORIGIN`.

## Funcionalidades não implementadas

- Frontend: ainda não implementado.
- Docker da API e do frontend: o `docker-compose.yml` atual sobe só o banco.

Todos os endpoints da seção 2 do enunciado estão implementados no backend.

## Uso de inteligência artificial

Ferramenta usada: **Claude Code** (CLI da Anthropic), com o modelo Claude.

- **Onde:** no backend (código, testes e migrations), nesta documentação e, a seguir, no frontend.
- **Como e por quê:** para escrever código e testes a partir do enunciado e do barema, conferindo as regras contra os exemplos do enunciado e revisando validações e tratamento de erros.
- **Aceito:** a organização por módulos e as funções puras das regras de negócio.
- **Alterado:** o corpo das requisições em consultas, exclusão e venda passou a ser ignorado, como pede V1, depois de um teste manual mostrar que JSON inválido ainda dava 400 nessas rotas. Um teste do próprio autor (potencial de jogador com 40 anos) também foi corrigido depois de uma falha, porque a regra estava certa e o teste não.
- **Descartado:** (a confirmar pelo autor antes da entrega).

Todo o código foi conferido contra o enunciado e executado nos testes descritos acima.
