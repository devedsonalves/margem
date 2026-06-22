import { authorModel } from '../models/authorModel.js'
import { bookModel } from '../models/bookModel.js'
import { publisherModel } from '../models/publisherModel.js'

export const bookService = {
  listAll(filters) {
    return bookModel.listAll(filters)
  },

  async findById(id) {
    const book = await bookModel.findById(id)
    if (!book) {
      const err = new Error('Livro nao encontrado')
      err.status = 404
      throw err
    }
    return book
  },

  async create(dados) {
    const normalized = await normalizeBookPayload(dados)
    const existing = await bookModel.findByIsbn(normalized.isbn)

    if (existing) {
      const err = new Error('Ja existe um livro com esse ISBN')
      err.status = 409
      throw err
    }

    return bookModel.create(normalized)
  },

  async update(id, dados) {
    await this.findById(id)

    const normalized = await normalizeBookPayload(dados)
    const existing = await bookModel.findByIsbn(normalized.isbn)

    if (existing && existing.id !== id) {
      const err = new Error('Ja existe um livro com esse ISBN')
      err.status = 409
      throw err
    }

    return bookModel.update(id, normalized)
  },

  async remove(id) {
    const removed = await bookModel.remove(id)
    if (!removed) {
      const err = new Error('Livro nao encontrado')
      err.status = 404
      throw err
    }
  },
}

async function normalizeBookPayload({
  title,
  genre,
  pages,
  isbn,
  publicationYear,
  authorId,
  publisherId,
}) {
  if (!title?.trim() || !genre?.trim() || !isbn?.trim() || !authorId || !publisherId) {
    const err = new Error(
      'Os campos "title", "genre", "isbn", "authorId" e "publisherId" sao obrigatorios',
    )
    err.status = 400
    throw err
  }

  if (Number(pages) <= 0) {
    const err = new Error('O campo "pages" deve ser maior que zero')
    err.status = 400
    throw err
  }

  const author = await authorModel.findById(Number(authorId))
  if (!author) {
    const err = new Error('O autor informado nao existe')
    err.status = 422
    throw err
  }

  const publisher = await publisherModel.findById(Number(publisherId))
  if (!publisher) {
    const err = new Error('A editora informada nao existe')
    err.status = 422
    throw err
  }

  return {
    title: title.trim(),
    genre: genre.trim(),
    pages: Number(pages),
    isbn: isbn.trim(),
    publicationYear: publicationYear ? Number(publicationYear) : null,
    authorId: Number(authorId),
    publisherId: Number(publisherId),
  }
}
