# Especificação: refatoração da API para NestJS

**Status:** Proposta
**Identificador:** `001-api-nestjs-refactor`

## Contexto

A API em `apps/api` usa Express com regras de negócio, acesso ao Prisma e tradução HTTP concentrados em arquivos de rota extensos. Isso aumenta o acoplamento, dificulta testes isolados e torna mudanças em autenticação e billing arriscadas. A refatoração também substituirá Prisma por TypeORM, preservando o schema PostgreSQL e os dados existentes.

## Objetivo

Migrar a API para NestJS com módulos orientados ao domínio, TypeORM, injeção de dependências, configuração validada, DTOs, documentação OpenAPI e testes com Vitest, sem alterar os contratos consumidos pelo web app.

## Histórias

### S1 — Consumidor da API

Como cliente existente, quero continuar usando os mesmos métodos, caminhos, corpos e formatos de resposta para que a migração não exija uma mudança simultânea no frontend.

### S2 — Pessoa desenvolvedora

Como pessoa desenvolvedora, quero encontrar controller, caso de uso e persistência pelo domínio para alterar uma funcionalidade sem percorrer arquivos de rota monolíticos.

### S3 — Operação

Como responsável pela operação, quero falha rápida em configuração inválida, logs correlacionáveis e health checks para diagnosticar incidentes com segurança.

## Requisitos funcionais

- RF-01: preservar todos os endpoints documentados em `docs/README.md`.
- RF-02: preservar autenticação `Authorization: Bearer <token>` e validade de sessão de sete dias durante a migração.
- RF-03: manter upload multipart no campo `pdf` e regras de limite de plano.
- RF-04: manter autorização por proprietário em documentos, destaques e cadernos.
- RF-05: manter idempotência e validação de token nos webhooks Asaas.
- RF-06: publicar documentação OpenAPI em `/docs`.
- RF-07: disponibilizar `GET /health` sem autenticação.

## Requisitos não funcionais

- RNF-01: TypeScript em modo estrito para código novo.
- RNF-02: controllers não acessam repositories TypeORM, `DataSource` ou SDKs externos diretamente.
- RNF-03: segredos obrigatórios não possuem fallback inseguro.
- RNF-04: erros públicos não expõem stack trace, segredo ou payload sensível.
- RNF-05: encerramento da aplicação desconecta recursos de infraestrutura.
- RNF-06: a troca de ORM não altera tabelas, colunas, constraints, índices ou dados de negócio existentes.
- RNF-07: `synchronize` permanece desabilitado em todos os ambientes; toda evolução de schema ocorre por migration versionada.
- RNF-08: migrations usam uma conexão dedicada, encerram o `DataSource` ao terminar e falham com código diferente de zero.
- RNF-09: testes usam Vitest em modo não interativo no CI e não compartilham estado mutável entre casos.

## Critérios de aceite

- Testes de contrato passam contra a implementação antiga e a nova.
- Web app executa os fluxos de cadastro, login, acervo, leitor, configurações e planos sem alteração contratual.
- API compila, inicia e encerra corretamente com Node.js suportado pelo monorepo.
- Swagger descreve autenticação, payloads, respostas e upload.
- Ausência de `JWT_SECRET` impede inicialização fora de teste.
- Webhook duplicado continua retornando sucesso sem processamento duplicado.
- Uma base vazia alcança o schema atual com `pnpm db:migrate` e pode reverter a última migration com `pnpm db:rollback`.
- Uma base existente gerenciada pelo Prisma pode adotar o histórico TypeORM sem recriar objetos ou perder dados.
- `pnpm test`, `pnpm test:unit`, `pnpm test:integration`, `pnpm test:contract` e `pnpm test:coverage` estão documentados e executam via Vitest.

## Fora do escopo

- Redesenhar o schema PostgreSQL ou renomear tabelas e colunas existentes.
- Alterar fornecedor de storage ou cobrança.
- Criar novos planos ou funcionalidades de produto.
- Migrar o frontend para outro cliente HTTP.
