# Arquitetura do web app

O projeto usa uma arquitetura orientada a features. Cada domínio concentra sua interface, seus casos de uso, seus modelos e seu acesso a dados. As rotas do Next.js permanecem finas e apenas delegam para a feature correspondente.

## Estrutura

```text
src/
  app/                 # Rotas, layout raiz e redirects do Next.js
  features/
    auth/              # Sessão, autenticação e telas de acesso
    billing/           # Planos, checkout e estado da assinatura
    home/              # Dashboard de leitura
    landing/           # Página pública e suas seções
    library/           # Acervo, documentos e upload
    reader/            # PDF, marcações e caderno
    shell/             # Estrutura compartilhada das telas autenticadas
  shared/
    api/               # Transporte HTTP e armazenamento do token
    ui/                # Componentes sem conhecimento de domínio
  styles/              # Estilos globais
```

Dentro de uma feature:

- `api/`: traduz o contrato HTTP para DTOs usados pela aplicação.
- `model/`: tipos, regras e transformações puras, sem React ou acesso à rede.
- `components/`: componentes visuais orientados por props.
- `use*.ts`: coordena estado e casos de uso da feature.
- `*Page.tsx`: compõe o fluxo da página sem implementar regras de negócio.

## Regras de dependência

1. `app` pode importar `features` e `shared`.
2. `features` podem importar `shared`.
3. Uma feature só importa outra quando o conceito pertence claramente à feature provedora, como `billing` consumindo o upload público de `library`.
4. `model` não importa componentes, providers, hooks nem APIs.
5. Componentes não chamam endpoints diretamente. A exceção é infraestrutura visual especializada, como a capa de PDF, que usa o adaptador de documentos para obter sua URL.
6. Nomes e formatos do backend, como `current_page`, são normalizados dentro de `api/` e não vazam para a interface.

## Aplicação de SOLID

- **Responsabilidade única:** páginas compõem, hooks coordenam, modelos calculam e adaptadores comunicam com o backend.
- **Aberto/fechado:** planos, itens de navegação e paletas são dados configuráveis; novos itens não exigem alterar a estrutura dos componentes.
- **Substituição de Liskov:** componentes recebem contratos estáveis e não dependem de implementações concretas fora de suas props.
- **Segregação de interfaces:** cada componente expõe apenas os comandos e dados necessários à sua renderização.
- **Inversão de dependência:** telas dependem dos casos de uso e adaptadores das features; detalhes de `fetch`, token e serialização ficam em `shared/api`.

## Evoluindo uma feature

1. Defina os tipos e regras puras em `model/`.
2. Implemente a tradução do backend em `api/`.
3. Coordene o caso de uso em um hook da feature.
4. Crie componentes controlados por props.
5. Mantenha a página como o ponto de composição.
6. Execute `pnpm --filter web exec tsc --noEmit`, `pnpm --filter web lint` e `pnpm --filter web build`.
