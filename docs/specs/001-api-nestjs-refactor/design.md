# Design técnico

## Arquitetura alvo

```text
apps/api/src/
├── main.ts
├── app.module.ts
├── config/
│   ├── configuration.ts
│   └── environment.schema.ts
├── infrastructure/
│   ├── database/
│   │   ├── database.module.ts
│   │   └── typeorm.config.ts
│   ├── http/
│   │   ├── filters/
│   │   └── interceptors/
│   └── integrations/
│       ├── asaas/
│       └── storage/
└── modules/
    ├── auth/
    ├── billing/
    ├── documents/
    ├── health/
    ├── highlights/
    └── notebooks/
```

Cada módulo segue, quando necessário:

```text
domain/          regras e tipos independentes do framework
application/     casos de uso e portas
infrastructure/  repositories/adapters
presentation/    controllers, DTOs e documentação HTTP
```

Não criar camadas vazias. Um módulo simples pode começar com controller, service e repository, sendo dividido quando a complexidade justificar.

## Dependências permitidas

```text
presentation -> application -> domain
infrastructure -> application/domain
bootstrap -> todos os módulos
domain -X-> NestJS, TypeORM, Express ou SDK externo
```

## Módulos

| Módulo     | Responsabilidade                             | Dependências externas         |
| ---------- | -------------------------------------------- | ----------------------------- |
| Health     | disponibilidade do processo                  | nenhuma                       |
| Auth       | sessão, perfil, senha, exportação e exclusão | TypeORM, bcrypt, JWT, billing |
| Documents  | catálogo, upload, URL, progresso e remoção   | TypeORM, storage, plans       |
| Highlights | destaques e notas de margem                  | TypeORM, plans                |
| Notebooks  | consulta/criação e autosave                  | TypeORM                       |
| Billing    | planos, checkout, assinatura e webhooks      | TypeORM, Asaas                |

## Preocupações transversais

- Um filtro global traduz exceções conhecidas para `{ error: string }`.
- Um guard JWT anexa um principal tipado à requisição.
- DTOs validam entrada antes dos casos de uso.
- Swagger deriva de decorators e DTOs.
- Logs incluem request ID, método, rota, status e duração; nunca token ou corpo sensível.
- O `DataSource` TypeORM possui ciclo de vida administrado pelo NestJS e é encerrado no shutdown.
- Repositories TypeORM concretos implementam portas da camada de aplicação; controllers não recebem `Repository<Entity>`.
- Transações que abrangem mais de um repository recebem um `EntityManager` transacional explícito.

## Pacote de banco

```text
packages/database/
├── src/
│   ├── data-source.ts
│   ├── entities/
│   ├── migrations/
│   ├── seeds/
│   └── scripts/
│       ├── adopt-baseline.ts
│       └── reset-database.ts
├── tsconfig.json
└── package.json
```

- `data-source.ts` é a única fonte de configuração usada pela CLI e pela API.
- Entities declaram nomes físicos explicitamente para preservar o schema atual.
- Migrations são determinísticas e não importam módulos da aplicação.
- `adopt-baseline.ts` é idempotente, valida o schema e só então registra o baseline.
- `reset-database.ts` exige `NODE_ENV=test|development` e confirmação de que a URL não aponta para produção.

## Scripts obrigatórios

Os scripts raiz encaminham para `@margem/database` ou `api`, permitindo execução consistente a partir do monorepo.

| Script                            | Semântica                                                                  |
| --------------------------------- | -------------------------------------------------------------------------- |
| `db:migration:create -- <nome>`   | cria migration vazia                                                       |
| `db:migration:generate -- <nome>` | gera diff para revisão, sem aplicar                                        |
| `db:migrate`                      | aplica migrations pendentes                                                |
| `db:rollback`                     | reverte somente a última migration                                         |
| `db:migration:show`               | lista migrations e estado de aplicação                                     |
| `db:baseline:adopt`               | valida e adota o schema legado em banco existente                          |
| `db:seed`                         | aplica seed idempotente do ambiente permitido                              |
| `db:reset`                        | recria banco local/teste e reaplica migrations/seeds; proibido em produção |
| `test`                            | executa todas as suítes Vitest uma vez                                     |
| `test:unit`                       | executa apenas `*.spec.ts`                                                 |
| `test:integration`                | executa `*.integration-spec.ts` com PostgreSQL isolado                     |
| `test:contract`                   | executa `*.contract-spec.ts`                                               |
| `test:watch`                      | watch local, sem uso no CI                                                 |
| `test:coverage`                   | executa suíte com cobertura V8 e thresholds                                |
| `typecheck`                       | valida TypeScript sem emitir arquivos                                      |

Argumentos após `--` devem ser preservados pelos scripts pnpm. CI executa, no mínimo, `lint`, `typecheck`, `test:unit`, `test:integration`, `test:contract` e `build`.

## Estratégia de testes

- Unitários substituem portas por fakes e não inicializam Nest nem banco.
- Integração testa repositories, transactions e migrations contra PostgreSQL real e isolado.
- Contrato inicializa a aplicação Nest completa e verifica método, rota, status, headers e payload.
- Testes de migration cobrem banco vazio, adoção do baseline e rollback da última migration reversível.
- A configuração de teste rejeita `DATABASE_URL` que não identifique explicitamente um banco de teste.

## Estratégia de migração

1. Congelar o contrato atual em testes.
2. Criar bootstrap e infraestrutura transversal.
3. Migrar health e auth.
4. Migrar notebooks, highlights e documents.
5. Migrar billing por último devido a webhooks e efeitos externos.
6. Executar smoke tests do web app.
7. Remover rotas e middleware Express legados.

## Segurança

- Rejeitar inicialização sem segredo JWT forte.
- Validar ownership no repositório usando `resourceId + userId`.
- Aplicar limite e MIME permitido no upload.
- Usar comparação segura para token do webhook quando aplicável.
- Não registrar senhas, JWTs, chaves S3, tokens Asaas ou conteúdo privado.
