# 📚 Gerenciador de Biblioteca Pessoal (Margem)

O **Margem** é um sistema fullstack para gerenciar um acervo pessoal de livros. O objetivo é permitir que o usuário faça o controle de sua coleção por meio de um CRUD operacional completo, estruturando o acervo de forma organizada por autores e editoras.

## 🚀 Funcionalidades Principais (CRUD)

* **[C] Cadastrar Livro**: Vincular uma nova obra a um Autor (`Author`) e a uma Editora (`Publisher`).
* **[R] Listar Acervo**: Visualizar todos os livros cadastrados trazendo os dados completos de quem escreveu e quem publicou.
* **[U] Atualizar Livro**: Modificar dados do livro ou o seu status de leitura atual.
* **[D] Remover Livro**: Excluir uma obra do acervo pessoal.

---

## 💾 Modelagem do Banco de Dados (4 Classes de Domínio)

O domínio do projeto foi modelado com **4 entidades interdependentes**, mapeadas em inglês para seguir as boas práticas de desenvolvimento de software.

```
┌──────────────────┐             ┌──────────────────┐
│     AUTHOR       │             │    PUBLISHER     │
├──────────────────┤             ├──────────────────┤
│ id (PK)          │             │ id (PK)          │
│ name             │             │ name             │
└─────────┬────────┘             └────────┬─────────┘
          │                               │
          │ 1                             │ 1
          │                               │
          │             * ┌───────────────▼──┐
          └──────────────►│      BOOK        │
                          ├──────────────────┤
                          │ id (PK)          │
                          │ title            │
                          │ publication_year │
                          │ reading_status   │
                          │ author_id (FK)   │
                          │ publisher_id (FK)│
                          │ user_id (FK)     │
                          └───────────────▲──┘
                                          │ *
                                          │ 
                                        1 │
                                 ┌────────┴─────────┐
                                 │      USER        │
                                 ├──────────────────┤
                                 │ id (PK)          │
                                 │ name             │
                                 │ email            │
                                 └──────────────────┘

```

### Dicionário de Dados

#### 1. Tabela: `users`

Dono da biblioteca pessoal que gerencia o acervo.

* `id` (PK): Identificador único (UUID ou INT).
* `name` (VARCHAR): Nome do usuário.
* `email` (VARCHAR): Email único para acesso ao sistema.

#### 2. Tabela: `authors`

Escritores das obras contidas na biblioteca.

* `id` (PK): Identificador único do autor.
* `name` (VARCHAR): Nome completo ou pseudônimo do escritor.

#### 3. Tabela: `publishers`

Empresas responsáveis pela publicação dos livros (Editoras).

* `id` (PK): Identificador único da editora.
* `name` (VARCHAR): Nome fantasia da publicadora.

#### 4. Tabela: `books`

A entidade central do CRUD, que unifica as relações do domínio.

* `id` (PK): Identificador único da obra.
* `title` (VARCHAR): Título do livro.
* `publication_year` (INT): Ano em que o livro foi lançado.
* `reading_status` (VARCHAR): Estado atual da leitura ('WANT_TO_READ', 'READING', 'READ').
* `author_id` (FK): Vincula o livro obrigatoriamente a um registro em `authors`.
* `publisher_id` (FK): Vincula o livro obrigatoriamente a um registro em `publishers`.
* `user_id` (FK): Vincula o livro ao usuário dono da coleção (`users`).

## 📐 Relações entre as Classes (Análise Conceitual)

* **Associação Direta (`Book` -> `Author` e `Publisher`)**: Um livro aponta diretamente para quem o escreveu e para a empresa que o publicou. Sem essas associações, a entidade `Book` perde sua consistência estrutural dentro deste domínio.
* **Agregação (`User` -> `Book`)**: O usuário possui uma coleção de livros. Caso a conta do usuário seja desativada, as entidades históricas de livros, autores e editoras ainda podem existir de forma independente no banco de dados.
