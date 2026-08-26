# Pesquisa técnica

## Estado atual

- Runtime: Node.js e TypeScript em monorepo pnpm/Turborepo.
- HTTP: Express, CORS, Multer e Swagger via comentários JSDoc.
- Persistência atual: Prisma/PostgreSQL pelo pacote `@margem/database`.
- Segurança: JWT e bcryptjs.
- Integrações: AWS SDK compatível com S3 e API Asaas.
- Domínios: auth, documents, highlights, notebooks e billing.

## Decisões pesquisadas

### Migração incremental

Adotar um monólito modular NestJS no mesmo `apps/api`. A migração deve ocorrer por domínio, usando testes de contrato como proteção. Uma troca de framework não justifica microserviços nem mudanças no banco.

### Adaptador HTTP

Usar `@nestjs/platform-express` inicialmente. Isso reduz diferenças no comportamento de Multer e permite reaproveitamento temporário de middleware Express quando necessário.

### Configuração

Usar `@nestjs/config` com schema de validação. `DATABASE_URL` e `JWT_SECRET` são obrigatórios; configurações S3 e Asaas são validadas quando os respectivos recursos estão habilitados.

### Persistência com TypeORM

Usar `@nestjs/typeorm`, `typeorm` e `pg`. O pacote `@margem/database` passa a ser dono das entities, migrations, configuração do `DataSource` e comandos de banco; `apps/api` importa a integração e implementa repositories por domínio. `synchronize`, `dropSchema` e logging de parâmetros sensíveis ficam desabilitados por padrão.

O `DataSource` da CLI lê `DATABASE_URL` e as migrations compiladas/TypeScript conforme o comando. Produção executa migrations como etapa única anterior ao start da aplicação, nunca automaticamente em cada réplica. Migrations geradas são ponto de partida e seu SQL deve ser revisado antes do commit.

As migrations Prisma existentes continuam como registro histórico durante a transição. Para bancos vazios, seu SQL é representado por migrations TypeORM equivalentes. Para bancos existentes, um comando único de adoção valida tabelas, colunas, índices e constraints esperados antes de registrar o baseline TypeORM; ele não altera dados e aborta em qualquer divergência.

### Testes com Vitest

Usar Vitest como runner único, `@nestjs/testing` para módulos isolados e `supertest` para HTTP. Arquivos seguem `*.spec.ts` (unitário), `*.integration-spec.ts` (integração) e `*.contract-spec.ts` (contrato). Integração usa PostgreSQL descartável ou uma URL exclusiva de teste, aplica migrations antes da suíte e limpa dados entre casos sem usar `synchronize`.

No CI, todos os comandos usam `vitest run`; watch é apenas local. Cobertura usa o provider V8 e limiares iniciais explícitos, elevados progressivamente sem excluir regras de negócio críticas.

### Autenticação

Usar Passport JWT ou guard equivalente apoiado por biblioteca madura. O token deve ser extraído exclusivamente do cabeçalho Bearer, e o segredo não pode usar `default_secret`.

### Limites arquiteturais

Cada domínio expõe controller e application service. Persistência e provedores externos ficam atrás de adapters injetáveis. Tipos de transporte não atravessam para regras de negócio.

### Compatibilidade

Gerar um OpenAPI-base da API atual e executar os mesmos testes contra ambas as versões. Respostas devem manter status e envelope existentes, inclusive `{ error: string }`.

## Riscos

| Risco                                         | Mitigação                                                  |
| --------------------------------------------- | ---------------------------------------------------------- |
| Mudança silenciosa de status ou payload       | Testes de contrato e comparação OpenAPI                    |
| Upload consumir memória excessiva             | Limite explícito de tamanho e validação MIME               |
| Webhook processado duas vezes                 | Persistir ID externo único e testar concorrência           |
| Efeitos colaterais ao excluir conta/documento | Caso de uso orquestrado e teste de falha parcial           |
| Configuração inválida descoberta em runtime   | Validação no bootstrap                                     |
| Migração longa com duas arquiteturas          | Fatias verticais pequenas e remoção do legado por módulo   |
| Divergência entre entities e schema existente | `synchronize: false`, migrations e teste de schema         |
| Baseline aplicado ao banco errado             | Validação completa e confirmação explícita de ambiente     |
| Testes alterarem dados locais                 | URL de teste obrigatória e proteção contra banco não teste |

## Questões a validar na implementação

- Definir limite máximo de PDF conforme planos e infraestrutura.
- Confirmar origens CORS por ambiente.
- Definir política de logging e identificador de correlação.
- Verificar se cancelamento Asaas deve bloquear ou apenas agendar exclusão de conta.
- Definir se o PostgreSQL de integração será fornecido pelo CI ou iniciado com Testcontainers.
