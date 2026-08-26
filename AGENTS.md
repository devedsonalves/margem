# AGENTS.md

Este arquivo orienta agentes que trabalham neste repositório. As instruções valem para todo o monorepo, salvo quando um `AGENTS.md` mais próximo do arquivo editado definir regras específicas.

## Contexto do projeto

Margem é uma plataforma de leitura e anotação de documentos. O repositório é um monorepo pnpm/Turborepo composto por:

- `apps/web`: frontend Next.js 14 com App Router, React 18 e Tailwind CSS;
- `apps/api`: API NestJS 11, CommonJS, Vitest e integrações com Asaas e storage S3;
- `packages/database`: entities, migrations e scripts TypeORM para PostgreSQL;
- `packages/types`: contratos TypeScript compartilhados;
- `docs`: visão de produto, decisões e especificações.

Use Node.js `>=20.11` e pnpm 9, conforme o `package.json` da raiz.

## Antes de alterar código

- Leia os arquivos próximos e preserve os padrões já usados no módulo.
- Verifique `git status` antes de editar. O worktree pode conter mudanças do usuário; não reverta nem reformate alterações fora do escopo.
- Consulte as especificações em `docs/specs` quando a tarefa tocar um fluxo documentado.
- Prefira mudanças pequenas e focadas. Não faça refactors oportunistas durante uma correção pontual.
- Não adicione dependências sem confirmar que a solução não existe no projeto ou na plataforma já adotada.

## Comandos principais

Execute os comandos a partir da raiz, salvo indicação contrária.

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm test
pnpm test:unit
pnpm test:integration
pnpm test:contract
pnpm format
```

Para trabalhar em um pacote isolado:

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter api dev
pnpm --filter api typecheck
pnpm --filter api test
pnpm --filter @margem/database build
pnpm --filter @margem/database typecheck
```

Não inicie processos em modo watch para validação automatizada. Use comandos one-shot como `build`, `typecheck` e `vitest run`.

## Arquitetura e dependências

- Preserve as fronteiras entre apresentação, domínio e infraestrutura.
- Controllers da API tratam HTTP e delegam regras a services; não coloque queries ou integrações externas diretamente neles.
- Integrações com PostgreSQL, Asaas e S3 pertencem às camadas de infraestrutura existentes.
- Rotas em `apps/web/src/app` devem ser finas e delegar a implementação a `apps/web/src/features`.
- Código reutilizado por várias features do web pertence a `apps/web/src/shared` somente quando tiver responsabilidade clara.
- Tipos usados pelos dois aplicativos pertencem a `packages/types`; persistência e entities pertencem a `packages/database`.
- Evite módulos genéricos como `utils`, `helpers` ou `common`. Nomeie arquivos e abstrações pelo domínio que representam.

## TypeScript e imports

- Mantenha o modo estrito e não introduza `any`; prefira tipos concretos ou `unknown` com narrowing.
- Use `import type` ou o modificador inline `type` para símbolos usados apenas em posições de tipo.
- Preserve imports em runtime quando NestJS ou TypeORM dependem de metadata de decorators.
- O alias `@/` aponta para `src/` tanto em `apps/api` quanto em `apps/web`.
- Use `@/` para imports entre áreas distantes da mesma aplicação. Imports relativos curtos dentro do mesmo módulo continuam aceitáveis.
- Importe pacotes compartilhados pelos nomes do workspace: `@margem/database` e `@margem/types`.
- Siga a formatação existente: aspas simples, sem ponto e vírgula e trailing commas conforme o Prettier.

## API NestJS

- Organize funcionalidades em `apps/api/src/modules/<dominio>`.
- Use DTOs/validação nas fronteiras HTTP quando adicionar ou alterar payloads.
- Mantenha autenticação e autorização explícitas com guards e decorators existentes.
- Nunca registre segredos, tokens, senhas, payloads sensíveis ou URLs assinadas.
- Preserve os contratos públicos documentados no OpenAPI. Mudanças incompatíveis exigem atualização dos contratos e testes correspondentes.
- Ao adicionar endpoints, cubra pelo menos regra de negócio e contrato HTTP relevante.

## Banco de dados e TypeORM

- `packages/database/src/entities.ts` é a fonte das entities TypeORM; mantenha-o coerente com as migrations.
- Nunca habilite `synchronize`; mudanças de schema devem ser versionadas por migration.
- Em propriedades nullable ou com tipos união, informe `type` explicitamente no decorator `@Column`. O metadata emitido pelo TypeScript pode converter `string | null` em `Object`.
- Preserve nomes de tabelas e colunas existentes. O banco atual usa identificadores legados com tabelas em PascalCase e colunas em snake_case.
- Não altere migrations já aplicadas para evoluir o schema. Crie uma nova migration reversível.
- Não execute `db:reset`, rollback ou outra operação destrutiva sem solicitação explícita e confirmação do banco alvo.
- Testes de integração exigem `TEST_DATABASE_URL` e devem usar um banco isolado de teste.
- O pacote `@margem/database` é carregado pelo diretório compilado. Recompile-o após alterar entities ou exports; os scripts `predev` e `prebuild` da API fazem isso automaticamente.

## Frontend Next.js

- Respeite os limites entre `app`, `features` e `shared`.
- Prefira Server Components por padrão; use `'use client'` somente quando estado, efeitos ou APIs do navegador forem necessários.
- Mantenha chamadas HTTP em módulos `api` da feature ou em `shared/api`, não dentro de componentes de apresentação.
- Preserve acessibilidade: HTML semântico, labels, navegação por teclado, foco visível e estados de loading/erro.
- Evite duplicar estado derivado e efeitos desnecessários. Componentes devem permanecer pequenos e focados.
- Reutilize tokens, estilos e componentes existentes antes de criar variantes novas.

## Testes e validação

Valide na menor abrangência que cubra a mudança e amplie conforme o risco:

1. Rode o typecheck do pacote alterado.
2. Rode os testes unitários relacionados.
3. Rode testes de contrato para alterações HTTP.
4. Rode testes de integração para persistência, migrations ou comportamento dependente do PostgreSQL.
5. Rode o build para alterações em configuração, resolução de módulos ou limites entre pacotes.

Não considere uma falha causada por ambiente como sucesso. Registre claramente testes não executados, pré-requisitos ausentes e qualquer falha preexistente.

## Segurança e configuração

- Nunca versione `.env`, credenciais reais, tokens ou dados pessoais.
- Atualize `.env.example` apenas com placeholders seguros quando introduzir uma variável.
- Valide configuração obrigatória na inicialização e falhe com mensagem clara, sem revelar valores sensíveis.
- Não enfraqueça CORS, validação JWT, proteção de webhooks ou verificação TLS para contornar problemas locais.
- Trate uploads como entrada não confiável e preserve limites de tipo e tamanho.

## Documentação e entrega

- Atualize documentação e exemplos quando comandos, variáveis, contratos ou comportamento público mudarem.
- Não edite artefatos gerados em `dist`, `.next` ou `coverage`; altere a fonte e regenere quando necessário.
- Não edite `pnpm-lock.yaml` manualmente. Use pnpm quando dependências mudarem.
- Ao concluir, informe arquivos relevantes, validações executadas e riscos ou pendências reais.
