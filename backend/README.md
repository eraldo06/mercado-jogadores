# Backend — Passe (Mercado de Jogadores)

API RESTful em NestJS com TypeScript e PostgreSQL 16 para o sistema Passe (mercado de jogadores fictício). Documentação interativa via Swagger OpenAPI.

## 1. Pré-requisitos

Ubuntu 24.04 com as seguintes ferramentas:

| Ferramenta | Versão | Observação |
| --- | --- | --- |
| Node.js | 22 LTS (22.12 ou superior, testado com 22.23.3) | Gerenciado via nvm |
| npm | 10 (testado com 10.9.0) | Incluído no Node.js |
| Docker / Compose | Docker Engine com Compose v2 | Usado para subir o PostgreSQL |
| PostgreSQL | 16 (postgres:16-alpine) | Banco de dados relacional |

## 2. Banco de dados

O banco roda em contêiner Docker (`postgres:16-alpine`), na porta padrão `5432` com usuário `mercado`, senha `mercado` e base `mercado`.

Na raiz do repositório:

```bash
docker compose up -d db
```

### Criar banco e aplicar migrations

Na pasta `backend/`:

```bash
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
```

O banco criado inicia vazio: sem jogadores, clubes, transações ou partidas pré-cadastradas.

### Recriar o banco do zero

Para apagar todos os dados e reaplicar as migrations do zero:

```bash
npx prisma migrate reset --force
```

## 3. Instalar e executar

A partir da pasta `backend/`:

```bash
cd backend
cp .env.example .env
npm ci
npx prisma migrate deploy
npm run start:dev
```

A API escuta em **http://localhost:3000**. Todas as rotas iniciam com o prefixo global `/api/v1` (a origem da API informada para a banca é `http://localhost:3000`).

### Swagger (Documentação Interativa)

A documentação interativa Swagger/OpenAPI cobre todos os 19 endpoints e fica disponível em:
- **http://localhost:3000/api/docs**

### Log de Requisições

Cada requisição recebida emite uma única linha no console via `Logger('HTTP')` do NestJS, no formato:
`LOG [HTTP] GET /api/v1/players 200`

## 4. Variáveis de ambiente

Arquivo `backend/.env.example`:

| Variável | Exemplo | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta HTTP da API |
| `CORS_ORIGIN` | `http://localhost:5173` | Origem autorizada no CORS (frontend) |
| `DATABASE_URL` | `postgresql://mercado:mercado@localhost:5432/mercado?schema=public` | String de conexão PostgreSQL |

## 5. Testes e qualidade

Na pasta `backend/`:

```bash
npm test              # Testes unitários das regras de negócio (Jest, termina sozinho)
npm run lint          # Linter ESLint
npm run format:check  # Verificação de formatação Prettier (somente leitura)
npm run build         # Compilação TypeScript com Nest CLI
```

### Testes de Ponta a Ponta (E2E)

Os testes E2E rodam contra o banco isolado `mercado_teste`. Para executá-los:

```bash
docker compose exec db psql -U mercado -d mercado -c "CREATE DATABASE mercado_teste;"
cd backend
DATABASE_URL="postgresql://mercado:mercado@localhost:5432/mercado_teste?schema=public" npx prisma migrate deploy
npm run test:e2e
```

## 6. Estrutura de pastas e bibliotecas

```text
backend/
├── prisma/
│   ├── schema.prisma        Modelagem das 7 tabelas e restrições
│   └── migrations/          Migrations versionadas SQL
├── src/
│   ├── domain/              Regras de negócio puras (cálculos de VM, overall, multa, comissão, placar)
│   ├── common/              Pipes (ParseIdPipe), filtros (HttpExceptionFilter), logs e validadores
│   ├── players/             Módulo de jogadores (cadastro, listagem, edição, condição, exclusão)
│   ├── clubs/               Módulo de clubes (criação, listagem por nome/patrimônio, consulta com elenco)
│   ├── market/              Módulo de mercado (compra, venda, histórico e exportação CSV)
│   ├── league/              Módulo da liga (escalação, partidas, duelos e classificação)
│   ├── prisma/              PrismaService e PrismaModule
│   ├── app.module.ts        Módulo raiz da aplicação
│   ├── app.setup.ts         Configuração comum (prefixo, CORS, validação e erros)
│   └── main.ts              Bootstrap e Swagger
└── test/                    Testes E2E (jogadores, compra, clubes)
```

Bibliotecas utilizadas:
- `@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`: Framework da API (stack obrigatória).
- `@prisma/client`, `prisma`: ORM e migrations (stack obrigatória).
- `class-validator`, `class-transformer`: Validação declarativa dos DTOs com mensagens estruturadas.
- `@nestjs/swagger`: Swagger OpenAPI interativo em `/api/docs`.
- `decimal.js`: Aritmética decimal de precisão arbitrária sem erros de ponto flutuante.
- `jest`, `ts-jest`, `supertest`: Suíte de testes automatizados.
- `eslint`, `prettier`: Qualidade e padronização do código.

## 7. Decisões e premissas

- **Precisão monetária:** Valores calculados com `Decimal` e arredondados uma vez ao final (HALF_UP, 2 casas).
- **Valor base e valor de mercado:** Valor base calculado e gravado no cadastro; valor de mercado e overall sempre calculados dinamicamente em tempo de execução e nunca gravados no banco.
- **Exclusão lógica:** Jogador livre excluído recebe timestamp em `excluido_em` (soft delete) e responde 404 em consultas futuras. Jogador em clube não pode ser excluído (409).
- **Validação de payload (V1/V7):** Endpoints sem corpo ignoram payload recebido. Campos controlados pelo sistema enviados no corpo são ignorados silenciosamente sem gerar erro.
- **Tratamento de erros:** Respostas estruturadas em JSON com `{ "message": "..." }`, sem exposição de stack trace.
- **Identificadores na URL:** IDs inválidos (não inteiros positivos, negativos, fora do range) respondem 404.

## 8. Funcionalidades não implementadas

Todos os 19 endpoints da seção 2 do enunciado estão 100% implementados e testados.

## 9. Uso de inteligência artificial

Ferramenta: Claude Code. Usado para acelerar a escrita das regras puras em `domain/`, testes unitários e migrations.
- **Aceito:** Modularização e funções puras de regras de negócio.
- **Alterado:** Tratamento de V1 ignorando payload em GET/DELETE e ajustes no cálculo de potencial.
- **Descartado:** a IA sugeriu persistir colunas calculadas (`valor_mercado`, `overall` e `patrimonio`) no schema do Prisma para simplificar consultas e ordenações; descartei essa modelagem ao revisar o barema B3, que penaliza expressamente qualquer coluna com valor calculado no banco. Além disso, a IA propôs remover acentos (`.normalize('NFD')`) na validação de unicidade dos clubes; descartei prontamente ao atentar à RN10, que exige diferenciar acentos ('Águias FC' e 'Aguias FC' devem ser aceitos como clubes distintos), mantendo a normalização restrita a minúsculas para não reprovar nos testes automatizados da banca.

Todo o código foi testado e validado. A inteligência artificial é uma ferramenta poderosa que agiliza significativamente o desenvolvimento, mas deve ser utilizada sempre com supervisão técnica criteriosa, validação contínua e domínio das regras de negócio.
