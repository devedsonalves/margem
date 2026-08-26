# Tarefas

## Baseline e contratos

- [ ] T001 Inventariar endpoints, status e payloads atuais.
- [ ] T002 Criar fixture de usuário, documento, destaque e caderno.
- [ ] T003 Configurar Vitest e criar testes de contrato para autenticação e health.
- [ ] T004 Criar testes de contrato Vitest para leitura e billing.
- [ ] T005 Registrar OpenAPI-base em `contracts/openapi.yaml`.

## Fundação

- [ ] T006 Adicionar dependências NestJS, TypeORM, PostgreSQL e Vitest.
- [ ] T007 Criar `main.ts`, `app.module.ts` e `nest-cli.json`.
- [ ] T008 Implementar configuração tipada e validação no bootstrap.
- [ ] T009 Implementar `DatabaseModule` e `DataSource` TypeORM com `synchronize: false` e shutdown limpo.
- [ ] T010 Implementar filtro de exceções compatível com `{ error }`.
- [ ] T011 Implementar logging estruturado com request ID.
- [ ] T012 Configurar Swagger e CORS por ambiente.

## Banco e migrations

- [ ] T035 Mapear o schema PostgreSQL atual em entities TypeORM com nomes físicos explícitos.
- [ ] T036 Converter o SQL histórico do Prisma em migrations TypeORM para bancos vazios.
- [ ] T037 Implementar e testar adoção idempotente do baseline para bancos existentes.
- [ ] T038 Configurar `db:migration:create`, `db:migration:generate`, `db:migrate`, `db:rollback` e `db:migration:show` no pacote e na raiz.
- [ ] T039 Implementar `db:seed` idempotente e `db:reset` protegido para desenvolvimento/teste.
- [ ] T040 Testar migrate/rollback em PostgreSQL isolado e documentar execução em deploy.

## Autenticação

- [ ] T013 Criar AuthModule e DTOs.
- [ ] T014 Implementar serviço de tokens sem fallback inseguro.
- [ ] T015 Implementar strategy, guard e decorator de principal atual.
- [ ] T016 Migrar cadastro e login.
- [ ] T017 Migrar perfil, senha, exportação e exclusão.
- [ ] T018 Cobrir autenticação e autorização com testes.

## Leitura

- [ ] T019 Criar NotebooksModule e migrar endpoints.
- [ ] T020 Criar HighlightsModule e migrar endpoints.
- [ ] T021 Criar DocumentsModule e adapter de storage.
- [ ] T022 Configurar interceptor de upload, MIME e limite de tamanho.
- [ ] T023 Migrar progresso, URL assinada e exclusão.
- [ ] T024 Testar ownership e limites de plano.

## Billing

- [ ] T025 Criar BillingModule e adapter Asaas.
- [ ] T026 Migrar consulta de planos e assinatura.
- [ ] T027 Migrar checkout, retorno e cancelamento.
- [ ] T028 Migrar webhook e processamento por tipo de evento.
- [ ] T029 Testar idempotência, duplicidade e falhas externas.

## Corte e qualidade

- [ ] T030 Configurar e executar `test`, `test:unit`, `test:integration`, `test:contract`, `test:watch` e `test:coverage` com Vitest.
- [ ] T031 Executar smoke test do web app contra NestJS.
- [ ] T032 Remover código Express sem consumidores.
- [ ] T033 Atualizar scripts raiz, Turbo, README, variáveis e procedimentos operacionais.
- [ ] T034 Validar implantação e procedimento de rollback.

## Dependências

- T006–T012 dependem de T001–T005.
- T035–T040 dependem da fundação e antecedem a migração dos módulos.
- T013–T024 dependem da fundação e da infraestrutura TypeORM.
- T025–T029 dependem da autenticação e da fundação.
- T030–T034 dependem de todos os módulos migrados.
