# Margem

> Leia com profundidade. Pense com clareza.

O Margem é uma plataforma para leitura, organização e anotação de documentos. O produto reúne biblioteca pessoal, leitor de PDF, destaques, notas de margem, cadernos e planos de assinatura em uma experiência única para transformar leitura em pensamento estruturado.

Este repositório contém o monorepo da aplicação web, da API e dos pacotes compartilhados de domínio e persistência.

## Visão geral

O projeto é composto por quatro áreas principais:

- **Web:** aplicação Next.js para landing page, autenticação, acervo, leitor e configurações.
- **API:** servidor Express responsável por autenticação, documentos, destaques, cadernos e cobrança.
- **Banco de dados:** schema Prisma sobre PostgreSQL, com migrations versionadas.
- **Integrações:** armazenamento de arquivos em um serviço compatível com S3/iDrive e pagamentos recorrentes via Asaas.

### Funcionalidades

- Cadastro, login e sessão baseada em JWT.
- Atualização de perfil, troca de senha, exportação de dados e exclusão da conta.
- Upload e gerenciamento de documentos PDF.
- Geração de URLs assinadas para leitura dos arquivos armazenados.
- Controle de progresso de leitura por documento.
- Destaques com página, texto, cor e coordenadas da seleção.
- Notas de margem vinculadas aos destaques.
- Cadernos associados a documentos.
- Planos Free e Premium na experiência web, com estados de assinatura persistidos no domínio.
- Checkout e webhooks de cobrança com Asaas.
- Documentação interativa da API via Swagger.

## Estrutura do repositório

```text
.
├── apps/
│   ├── api/                    # API Express
│   │   └── src/
│   │       ├── middleware/     # Autorização e autenticação
│   │       ├── routes/         # Endpoints HTTP
│   │       ├── services/       # Asaas, planos e storage
│   │       └── lib/            # Clientes compartilhados, como Prisma
│   └── web/                    # Aplicação Next.js
│       ├── src/app/            # Rotas finas do App Router
│       ├── src/features/       # Domínios da interface
│       ├── src/shared/         # HTTP, token e UI compartilhada
│       └── public/             # Assets estáticos utilizados pela aplicação
├── packages/
│   ├── database/               # Prisma schema, client e migrations
│   └── types/                  # DTOs e tipos compartilhados
├── docs/                       # Documentação complementar
├── .env.example                # Modelo seguro de configuração local
├── package.json                # Scripts e dependências do workspace
├── pnpm-workspace.yaml         # Pacotes incluídos no monorepo
└── turbo.json                  # Pipeline de build, lint e desenvolvimento
```

A aplicação web segue uma arquitetura orientada a features. As rotas em `apps/web/src/app` delegam para features como `auth`, `billing`, `home`, `landing`, `library`, `reader` e `settings`. A documentação detalhada dessas regras está em [`apps/web/ARCHITECTURE.md`](apps/web/ARCHITECTURE.md).

## Pré-requisitos

- Node.js **18 ou superior**.
- pnpm **9** ou compatível com o `packageManager` definido no `package.json`.
- PostgreSQL acessível pela aplicação.
- Um bucket em storage compatível com S3 para upload de PDFs.
- Conta Asaas apenas se os fluxos de cobrança forem utilizados.

Para ativar o pnpm por meio do Corepack:

```bash
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

## Configuração local

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Criar o arquivo de ambiente

Linux/macOS:

```bash
cp .env.example .env
```

PowerShell:

```powershell
Copy-Item .env.example .env
```

Preencha o `.env` com os valores do ambiente local. O arquivo `.env` não deve ser versionado.

### 3. Configurar o banco

Gere o client Prisma:

```bash
pnpm --filter @margem/database exec prisma generate --schema prisma/schema.prisma
```

Em desenvolvimento, aplique as migrations e crie o banco conforme necessário:

```bash
pnpm --filter @margem/database exec prisma migrate dev --schema prisma/schema.prisma
```

Em ambientes de staging ou produção, use apenas migrations já versionadas:

```bash
pnpm --filter @margem/database exec prisma migrate deploy --schema prisma/schema.prisma
```

### 4. Iniciar o ambiente

Para iniciar web e API juntos:

```bash
pnpm dev
```

Com a configuração padrão do `.env.example`, os endereços são:

| Serviço      | URL                            |
| ------------ | ------------------------------ |
| Web          | `http://localhost:3000`        |
| API          | `http://localhost:5000`        |
| Health check | `http://localhost:5000/health` |
| Swagger      | `http://localhost:5000/docs`   |

É possível iniciar cada aplicação separadamente:

```bash
pnpm --filter web dev
pnpm --filter api dev
```

## Variáveis de ambiente

O arquivo [`.env.example`](.env.example) contém um modelo completo. Nunca substitua os placeholders por credenciais reais dentro desse arquivo ou do código-fonte.

| Variável                           | Obrigatória  | Finalidade                                                                       |
| ---------------------------------- | ------------ | -------------------------------------------------------------------------------- |
| `DATABASE_URL`                     | Sim          | Connection string do PostgreSQL usada pelo Prisma.                               |
| `JWT_SECRET`                       | Sim          | Segredo para assinar e validar tokens de sessão. Use um valor longo e aleatório. |
| `PORT`                             | Não          | Porta da API. O exemplo usa `5000`; o código usa `3001` como fallback.           |
| `APP_URL`                          | Recomendável | URL principal usada nos retornos de checkout.                                    |
| `FRONTEND_URL`                     | Recomendável | URL pública do frontend.                                                         |
| `NEXT_PUBLIC_API_URL`              | Sim no web   | URL da API exposta ao navegador.                                                 |
| `IDRIVE_E2_ACCESS_KEY_ID`          | Para uploads | Access key do storage compatível com S3.                                         |
| `IDRIVE_E2_SECRET_ACCESS_KEY`      | Para uploads | Secret key do storage.                                                           |
| `IDRIVE_E2_ENDPOINT`               | Para uploads | Endpoint S3 compatível do provedor.                                              |
| `IDRIVE_E2_BUCKET_NAME`            | Para uploads | Bucket usado para armazenar PDFs.                                                |
| `IDRIVE_E2_REGION`                 | Para uploads | Região do bucket; `us-east-1` é o fallback do serviço.                           |
| `ASAAS_ENVIRONMENT`                | Para billing | `sandbox` ou `production`.                                                       |
| `ASAAS_API_KEY`                    | Para billing | Token de integração da conta Asaas.                                              |
| `ASAAS_CALLBACK_BASE_URL`          | Para billing | URL pública usada nos callbacks de checkout.                                     |
| `ASAAS_WEBHOOK_BASE_URL`           | Para billing | URL pública que recebe os webhooks.                                              |
| `ASAAS_WEBHOOK_EMAIL`              | Não          | E-mail associado à configuração automática do webhook.                           |
| `ASAAS_WEBHOOK_TOKEN`              | Recomendável | Token para proteger o webhook recebido.                                          |
| `ASAAS_AUTO_CONFIGURE_WEBHOOK`     | Não          | Ativa ou desativa a configuração automática do webhook.                          |
| `ASAAS_BILLING_TYPES`              | Não          | Tipos de cobrança aceitos; o exemplo usa `CREDIT_CARD`.                          |
| `ASAAS_CHECKOUT_MINUTES_TO_EXPIRE` | Não          | Tempo de expiração do checkout em minutos.                                       |

O serviço de billing também reconhece configurações avançadas como `ASAAS_API_URL`, `ASAAS_CHECKOUT_URL`, `ASAAS_CHECKOUT_RETURN_BASE_URL`, `PUBLIC_API_URL` e `API_URL` quando o ambiente exigir URLs explícitas.

## Scripts disponíveis

### Workspace

| Comando       | Descrição                                                      |
| ------------- | -------------------------------------------------------------- |
| `pnpm dev`    | Inicia os pacotes com tarefa de desenvolvimento via Turborepo. |
| `pnpm build`  | Compila API e web em modo de produção.                         |
| `pnpm lint`   | Executa as tarefas de lint configuradas no workspace.          |
| `pnpm format` | Formata arquivos TypeScript, TSX e Markdown com Prettier.      |

### API

```bash
pnpm --filter api dev
pnpm --filter api build
pnpm --filter api start
```

### Web

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web start
pnpm --filter web lint
```

## API

A API usa `Authorization: Bearer <token>` nas rotas protegidas. A especificação OpenAPI pode ser consultada em `/docs` quando a API estiver em execução.

### Endpoints principais

| Método   | Rota                       | Autenticação | Descrição                                          |
| -------- | -------------------------- | ------------ | -------------------------------------------------- |
| `GET`    | `/health`                  | Não          | Verifica se a API está disponível.                 |
| `POST`   | `/auth/register`           | Não          | Cria uma conta e retorna a sessão.                 |
| `POST`   | `/auth/login`              | Não          | Autentica o usuário e retorna a sessão.            |
| `GET`    | `/auth/me`                 | Sim          | Consulta o perfil autenticado.                     |
| `PATCH`  | `/auth/me`                 | Sim          | Atualiza nome e e-mail.                            |
| `PATCH`  | `/auth/password`           | Sim          | Altera a senha.                                    |
| `GET`    | `/auth/export`             | Sim          | Exporta os dados da conta.                         |
| `DELETE` | `/auth/me`                 | Sim          | Exclui a conta autenticada.                        |
| `GET`    | `/documents`               | Sim          | Lista documentos do usuário.                       |
| `POST`   | `/documents/upload`        | Sim          | Faz upload de um PDF via multipart/form-data.      |
| `GET`    | `/documents/:id/url`       | Sim          | Gera uma URL assinada para leitura.                |
| `PATCH`  | `/documents/:id/progress`  | Sim          | Atualiza a página atual e o progresso.             |
| `DELETE` | `/documents/:id`           | Sim          | Exclui um documento.                               |
| `GET`    | `/highlights/:documentId`  | Sim          | Lista destaques de um documento.                   |
| `POST`   | `/highlights`              | Sim          | Cria destaque e nota de margem opcional.           |
| `DELETE` | `/highlights/:id`          | Sim          | Remove um destaque.                                |
| `GET`    | `/notebooks`               | Sim          | Lista cadernos, com filtro opcional por documento. |
| `PATCH`  | `/notebooks/:id`           | Sim          | Atualiza o conteúdo JSON de um caderno.            |
| `GET`    | `/billing/plans`           | Não          | Lista os planos disponíveis.                       |
| `GET`    | `/billing/subscription`    | Sim          | Consulta assinatura e status do plano.             |
| `POST`   | `/billing/checkout`        | Sim          | Cria uma sessão de checkout.                       |
| `DELETE` | `/billing/subscription`    | Sim          | Solicita cancelamento da assinatura.               |
| `GET`    | `/billing/checkout-return` | Não          | Processa o retorno do checkout para o frontend.    |
| `POST`   | `/billing/webhooks/asaas`  | Não\*        | Recebe eventos de cobrança do Asaas.               |

\* O webhook é uma rota de integração externa e deve ser protegido com o token/configuração correspondente do ambiente.

### Exemplos rápidos

Health check:

```bash
curl http://localhost:5000/health
```

Cadastro:

```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Leitor Margem","email":"leitor@example.com","password":"uma-senha-local-forte"}'
```

Upload de PDF:

```bash
curl -X POST http://localhost:5000/documents/upload \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "pdf=@./meu-livro.pdf" \
  -F "title=Meu livro" \
  -F "total_pages=120"
```

## Banco de dados

O schema está em [`packages/database/prisma/schema.prisma`](packages/database/prisma/schema.prisma). Entre os principais agregados estão:

- `User`: identidade, credenciais e estado do plano.
- `Document`: metadados do PDF e progresso de leitura.
- `Highlight`: destaque por página, texto, cor e coordenadas.
- `MarginNote`: nota vinculada a um destaque.
- `Notebook`: caderno associado opcionalmente a um documento.
- `BillingCheckoutSession`: sessões de checkout externas.
- `BillingSubscription`: assinaturas e ciclo de cobrança.
- `BillingWebhookEvent`: eventos do provedor processados pela API.

As migrations atuais ficam em `packages/database/prisma/migrations/` e devem ser aplicadas em ordem pelo Prisma. Não edite uma migration já aplicada; crie uma nova migration para cada alteração de schema.

## Convenções de desenvolvimento

Ao criar ou evoluir uma feature no frontend:

1. Defina tipos e transformações puras em `model/`.
2. Traduza o contrato HTTP em `api/`.
3. Coordene estado e casos de uso em um hook `use*.ts`.
4. Mantenha componentes visuais controlados por props.
5. Deixe a rota em `app/` fina, apenas compondo a feature.
6. Centralize transporte HTTP e token em `shared/api`.

Antes de abrir um pull request, execute:

```bash
pnpm build
pnpm lint
git diff --check
```

## Licença

Este repositório ainda não possui um arquivo de licença definido. Consulte os responsáveis pelo projeto antes de redistribuir o código.
