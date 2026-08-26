# Pesquisa de produto

## Contexto observado

O produto já possui landing page, autenticação, acervo, leitor, destaques, cadernos, configurações e assinatura. A API atual é uma aplicação Express organizada em rotas, middleware e serviços, com Prisma/PostgreSQL, armazenamento compatível com S3 e Asaas.

## Hipóteses

| Hipótese                                                        | Evidência a buscar                                        | Sinal de sucesso                           |
| --------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------ |
| Manter leitura e notas no mesmo contexto aumenta a continuidade | Entrevistas e eventos de retorno ao documento             | Mais sessões retomadas na última página    |
| Destaques vinculados à origem têm mais valor que notas isoladas | Uso de destaque, nota de margem e caderno                 | Conversão de destaque em elaboração        |
| Limites claros aumentam confiança na assinatura                 | Dúvidas de suporte e abandono no checkout                 | Menos abandono e menos dúvidas sobre plano |
| Uma API modular reduz risco e tempo de evolução                 | Incidentes e tempo de entrega antes/depois da refatoração | Menor lead time sem regressão contratual   |

## Perguntas abertas

- Qual é o principal momento de valor: upload, primeiro destaque ou primeira nota?
- Como usuários esperam pesquisar e relacionar anotações entre documentos?
- Quais limites do plano gratuito são percebidos como justos?
- Exportação atual é suficiente para transmitir segurança sobre portabilidade?

## Instrumentação recomendada

- Upload concluído e falha de upload, sem registrar conteúdo do documento.
- Documento aberto, página retomada e leitura concluída.
- Destaque criado/removido e nota de margem criada.
- Checkout iniciado, confirmado, expirado ou cancelado.
- Erros por endpoint, latência p95 e taxa de respostas 5xx.

## Restrições

- Não coletar texto de documentos ou anotações em analytics.
- Não incluir segredos, tokens ou dados pessoais em logs.
- Tratar compatibilidade da API como requisito durante a migração.
- Validar hipóteses com usuários antes de ampliar o escopo do produto.
