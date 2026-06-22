import { api } from '../api.js'

export const bookService = {
  list() {
    return api.getBooks()
  },

  create({ title, genre, pages, isbn, publicationYear, authorId, publisherId }) {
    if (!title?.trim() || !genre?.trim() || !isbn?.trim()) {
      throw new Error('Titulo, genero e ISBN sao obrigatorios')
    }

    if (!authorId || !publisherId) {
      throw new Error('Selecione um autor e uma editora')
    }

    if (Number(pages) <= 0) {
      throw new Error('A quantidade de paginas deve ser maior que zero')
    }

    return api.createBook({
      title: title.trim(),
      genre: genre.trim(),
      pages: Number(pages),
      isbn: isbn.trim(),
      publicationYear: publicationYear ? Number(publicationYear) : null,
      authorId: Number(authorId),
      publisherId: Number(publisherId),
    })
  },

  remove(id) {
    return api.removeBook(id)
  },
}
