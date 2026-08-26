# Plano de implementação

## Fase 0 — baseline

- Registrar respostas atuais dos fluxos críticos.
- Criar testes de contrato para rotas públicas e protegidas.
- Confirmar versões de Node.js, NestJS, TypeORM, driver PostgreSQL e Vitest compatíveis.
- Congelar o schema e o histórico das migrations Prisma como referência para a transição.

**Saída:** suíte capaz de detectar quebra de método, rota, status ou payload.

## Fase 1 — fundação NestJS

- Adicionar dependências, `nest-cli.json`, bootstrap e `AppModule`.
- Configurar variáveis de ambiente validadas, CORS e Swagger.
- Criar `DatabaseModule`/`DataSource`, filtro de erros e logging com request ID.
- Configurar Vitest para suítes unitárias, integração e contrato.

**Saída:** `/health` funcional no novo bootstrap.

## Fase 1.1 — transição de persistência

- Mapear o schema existente em entities TypeORM sem mudanças físicas no banco.
- Converter o histórico SQL existente em migrations TypeORM para provisionar bancos vazios.
- Criar adoção explícita do baseline para bancos já gerenciados pelo Prisma, validando o schema antes de registrar o histórico TypeORM.
- Disponibilizar scripts de gerar, criar, executar, reverter e listar migrations, além de seed e reset exclusivo para ambiente local/teste.
- Manter `synchronize: false` e revisar o SQL de toda migration gerada antes do commit.

**Saída:** banco vazio e banco existente convergem para o mesmo schema, sem perda de dados.

## Fase 2 — identidade

- Implementar AuthModule, JWT strategy/guard e decorator do usuário atual.
- Migrar cadastro, login, perfil, senha, exportação e exclusão.
- Cobrir credenciais inválidas, conflitos e autorização.

**Saída:** fluxos de autenticação compatíveis com a API atual.

## Fase 3 — leitura

- Migrar NotebooksModule e HighlightsModule.
- Migrar DocumentsModule e adapter de storage.
- Validar ownership, limites de plano, progresso e upload.

**Saída:** acervo e leitor funcionam contra NestJS.

## Fase 4 — cobrança

- Encapsular cliente Asaas em adapter injetável.
- Separar checkout, reconciliação, cancelamento e processamento de eventos.
- Preservar idempotência e testar eventos duplicados.

**Saída:** planos, checkout, assinatura e webhook compatíveis.

## Fase 5 — corte

- Rodar com Vitest os testes unitários, integração, contrato e cobertura; executar também smoke do web app.
- Atualizar documentação e comandos do workspace.
- Remover bootstrap, rotas e middleware Express legados.
- Implantar com rollback para a versão anterior disponível.

**Saída:** NestJS é a única implementação da API.

## Estratégia de entrega

Cada fase deve produzir uma mudança pequena, revisável e reversível. A substituição do ORM preserva o schema; futuras alterações físicas de banco devem ficar em migrations próprias e não ser misturadas com mudanças contratuais.
