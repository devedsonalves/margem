# 📚 Gerenciador de Biblioteca Pessoal (Margem)

O **Margem** é uma API Node.js com Express para gerenciar um acervo pessoal de livros. O sistema organiza livros por autores e editoras e permite acompanhar o progresso de leitura de cada obra.

## 🚀 Como executar

```bash
npm install
npm run dev
```

Por padrão, a API fica disponível em:

```text
http://localhost:3000
```

## ✅ Funcionalidades principais

* **Autores**: cadastrar, listar, consultar, atualizar e remover autores.
* **Editoras**: cadastrar, listar, consultar, atualizar e remover editoras.
* **Livros**: cadastrar, listar, filtrar por autor/editora, consultar, atualizar e remover livros.
* **Acompanhamento de leitura**: registrar status, página atual, datas e observações de leitura.

---

## 💾 Modelagem do banco de dados

O domínio do projeto possui **4 entidades principais**, mapeadas em inglês no banco de dados.

```text
┌──────────────────┐             ┌──────────────────┐
│     AUTHORS      │             │    PUBLISHERS    │
├──────────────────┤             ├──────────────────┤
│ id (PK)          │             │ id (PK)          │
│ name             │             │ name             │
│ country          │             │ headquarters     │
│ bio              │             │ founded_year     │
│ created_at       │             │ created_at       │
└─────────┬────────┘             └────────┬─────────┘
          │                               │
          │ 1                             │ 1
          │                               │
          │             * ┌───────────────▼──┐
          └──────────────►│      BOOKS       │
                          ├──────────────────┤
                          │ id (PK)          │
                          │ title            │
                          │ genre            │
                          │ pages            │
                          │ isbn             │
                          │ publication_year │
                          │ author_id (FK)   │
                          │ publisher_id (FK)│
                          │ created_at       │
                          └───────────────┬──┘
                                          │ 1
                                          │
                                        * │
                                 ┌────────▼─────────┐
                                 │ READING_TRACKERS │
                                 ├──────────────────┤
                                 │ id (PK)          │
                                 │ book_id (FK)     │
                                 │ status           │
                                 │ current_page     │
                                 │ started_at       │
                                 │ finished_at      │
                                 │ notes            │
                                 │ created_at       │
                                 └──────────────────┘
```

### Dicionário de dados

#### 1. Tabela: `authors`

Autores das obras cadastradas no acervo.

* `id` (PK): identificador único do autor.
* `name` (TEXT): nome completo ou pseudônimo do autor.
* `country` (TEXT): país de origem.
* `bio` (TEXT): breve biografia.
* `created_at` (TEXT): data de criação do registro.

#### 2. Tabela: `publishers`

Editoras responsáveis pela publicação dos livros.

* `id` (PK): identificador único da editora.
* `name` (TEXT): nome da editora. Deve ser único.
* `headquarters` (TEXT): sede da editora.
* `founded_year` (INTEGER): ano de fundação.
* `created_at` (TEXT): data de criação do registro.

#### 3. Tabela: `books`

Entidade central do acervo, vinculada a um autor e a uma editora.

* `id` (PK): identificador único do livro.
* `title` (TEXT): título do livro.
* `genre` (TEXT): gênero literário.
* `pages` (INTEGER): total de páginas. Deve ser maior que zero.
* `isbn` (TEXT): ISBN do livro. Deve ser único.
* `publication_year` (INTEGER): ano de publicação.
* `author_id` (FK): vínculo obrigatório com `authors`.
* `publisher_id` (FK): vínculo obrigatório com `publishers`.
* `created_at` (TEXT): data de criação do registro.

#### 4. Tabela: `reading_trackers`

Registros de acompanhamento de leitura associados a livros.

* `id` (PK): identificador único do acompanhamento.
* `book_id` (FK): vínculo obrigatório com `books`.
* `status` (TEXT): status da leitura. Valores aceitos: `backlog`, `reading`, `finished`.
* `current_page` (INTEGER): página atual da leitura.
* `started_at` (TEXT): data de início.
* `finished_at` (TEXT): data de conclusão.
* `notes` (TEXT): observações livres.
* `created_at` (TEXT): data de criação do registro.

## 🔗 Rotas da API

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/health` | Verifica se a API está online. |
| `GET` | `/api` | Retorna informações gerais da API. |
| `GET` | `/authors` | Lista autores. |
| `GET` | `/authors/:id` | Consulta um autor por ID. |
| `POST` | `/authors` | Cria um autor. |
| `PUT` | `/authors/:id` | Atualiza um autor. |
| `DELETE` | `/authors/:id` | Remove um autor. |
| `GET` | `/publishers` | Lista editoras. |
| `GET` | `/publishers/:id` | Consulta uma editora por ID. |
| `POST` | `/publishers` | Cria uma editora. |
| `PUT` | `/publishers/:id` | Atualiza uma editora. |
| `DELETE` | `/publishers/:id` | Remove uma editora. |
| `GET` | `/books` | Lista livros. Aceita `authorId` e `publisherId` como filtros. |
| `GET` | `/books/:id` | Consulta um livro por ID. |
| `POST` | `/books` | Cria um livro. |
| `PUT` | `/books/:id` | Atualiza um livro. |
| `DELETE` | `/books/:id` | Remove um livro. |
| `GET` | `/reading-trackers` | Lista acompanhamentos. Aceita `bookId` como filtro. |
| `GET` | `/reading-trackers/:id` | Consulta um acompanhamento por ID. |
| `POST` | `/reading-trackers` | Cria um acompanhamento. |
| `PUT` | `/reading-trackers/:id` | Atualiza um acompanhamento. |
| `DELETE` | `/reading-trackers/:id` | Remove um acompanhamento. |

## 📦 Exemplos de requisições em JSON

Execute as requisições de criação na ordem abaixo para reaproveitar os IDs nos exemplos seguintes.

```json
{
  "baseUrl": "http://localhost:3000",
  "requests": [
    {
      "name": "Health check",
      "method": "GET",
      "url": "/health"
    },
    {
      "name": "Informações da API",
      "method": "GET",
      "url": "/api"
    },
    {
      "name": "Criar autor",
      "method": "POST",
      "url": "/authors",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "name": "Machado de Assis",
        "country": "Brasil",
        "bio": "Autor brasileiro do Realismo."
      }
    },
    {
      "name": "Listar autores",
      "method": "GET",
      "url": "/authors"
    },
    {
      "name": "Buscar autor por ID",
      "method": "GET",
      "url": "/authors/1"
    },
    {
      "name": "Atualizar autor",
      "method": "PUT",
      "url": "/authors/1",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "name": "Machado de Assis",
        "country": "Brasil",
        "bio": "Romancista, contista, poeta e cronista brasileiro."
      }
    },
    {
      "name": "Criar editora",
      "method": "POST",
      "url": "/publishers",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "name": "Companhia das Letras",
        "headquarters": "Sao Paulo",
        "foundedYear": 1986
      }
    },
    {
      "name": "Listar editoras",
      "method": "GET",
      "url": "/publishers"
    },
    {
      "name": "Buscar editora por ID",
      "method": "GET",
      "url": "/publishers/1"
    },
    {
      "name": "Atualizar editora",
      "method": "PUT",
      "url": "/publishers/1",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "name": "Companhia das Letras",
        "headquarters": "Sao Paulo",
        "foundedYear": 1986
      }
    },
    {
      "name": "Criar livro",
      "method": "POST",
      "url": "/books",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "title": "Dom Casmurro",
        "genre": "Romance",
        "pages": 256,
        "isbn": "9788535910663",
        "publicationYear": 1899,
        "authorId": 1,
        "publisherId": 1
      }
    },
    {
      "name": "Listar livros",
      "method": "GET",
      "url": "/books"
    },
    {
      "name": "Filtrar livros por autor",
      "method": "GET",
      "url": "/books?authorId=1"
    },
    {
      "name": "Filtrar livros por editora",
      "method": "GET",
      "url": "/books?publisherId=1"
    },
    {
      "name": "Buscar livro por ID",
      "method": "GET",
      "url": "/books/1"
    },
    {
      "name": "Atualizar livro",
      "method": "PUT",
      "url": "/books/1",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "title": "Dom Casmurro",
        "genre": "Romance brasileiro",
        "pages": 256,
        "isbn": "9788535910663",
        "publicationYear": 1899,
        "authorId": 1,
        "publisherId": 1
      }
    },
    {
      "name": "Criar acompanhamento de leitura",
      "method": "POST",
      "url": "/reading-trackers",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "bookId": 1,
        "status": "reading",
        "currentPage": 80,
        "startedAt": "2026-06-15",
        "finishedAt": null,
        "notes": "Leitura em andamento."
      }
    },
    {
      "name": "Listar acompanhamentos",
      "method": "GET",
      "url": "/reading-trackers"
    },
    {
      "name": "Filtrar acompanhamentos por livro",
      "method": "GET",
      "url": "/reading-trackers?bookId=1"
    },
    {
      "name": "Buscar acompanhamento por ID",
      "method": "GET",
      "url": "/reading-trackers/1"
    },
    {
      "name": "Atualizar acompanhamento como finalizado",
      "method": "PUT",
      "url": "/reading-trackers/1",
      "headers": {
        "Content-Type": "application/json"
      },
      "body": {
        "bookId": 1,
        "status": "finished",
        "currentPage": 256,
        "startedAt": "2026-06-15",
        "finishedAt": "2026-06-20",
        "notes": "Livro finalizado."
      }
    },
    {
      "name": "Excluir acompanhamento",
      "method": "DELETE",
      "url": "/reading-trackers/1"
    },
    {
      "name": "Excluir livro",
      "method": "DELETE",
      "url": "/books/1"
    },
    {
      "name": "Excluir editora",
      "method": "DELETE",
      "url": "/publishers/1"
    },
    {
      "name": "Excluir autor",
      "method": "DELETE",
      "url": "/authors/1"
    }
  ]
}
```

## 📌 Regras de validação principais

* `authors.name` é obrigatório.
* `publishers.name` é obrigatório e único.
* `books.title`, `books.genre`, `books.isbn`, `books.authorId` e `books.publisherId` são obrigatórios.
* `books.pages` deve ser maior que zero.
* `books.isbn` deve ser único.
* `reading_trackers.bookId` e `reading_trackers.status` são obrigatórios.
* `reading_trackers.status` aceita apenas `backlog`, `reading` ou `finished`.
* Para marcar uma leitura como `finished`, `currentPage` deve ser igual ao total de páginas do livro.
