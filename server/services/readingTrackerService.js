import { bookModel } from '../models/bookModel.js'
import { readingTrackerModel } from '../models/readingTrackerModel.js'

const VALID_STATUS = ['backlog', 'reading', 'finished']

export const readingTrackerService = {
  listAll(bookId) {
    return readingTrackerModel.listAll(bookId ? Number(bookId) : null)
  },

  async findById(id) {
    const tracker = await readingTrackerModel.findById(id)
    if (!tracker) {
      const err = new Error('Acompanhamento de leitura nao encontrado')
      err.status = 404
      throw err
    }
    return tracker
  },

  async create(dados) {
    const normalized = await normalizeTrackerPayload(dados)
    return readingTrackerModel.create(normalized)
  },

  async update(id, dados) {
    await this.findById(id)
    const normalized = await normalizeTrackerPayload(dados)
    return readingTrackerModel.update(id, normalized)
  },

  async remove(id) {
    const removed = await readingTrackerModel.remove(id)
    if (!removed) {
      const err = new Error('Acompanhamento de leitura nao encontrado')
      err.status = 404
      throw err
    }
  },
}

async function normalizeTrackerPayload({
  bookId,
  status,
  currentPage,
  startedAt,
  finishedAt,
  notes,
}) {
  if (!bookId || !status) {
    const err = new Error('Os campos "bookId" e "status" sao obrigatorios')
    err.status = 400
    throw err
  }

  if (!VALID_STATUS.includes(status)) {
    const err = new Error('O status deve ser backlog, reading ou finished')
    err.status = 400
    throw err
  }

  const book = await bookModel.findById(Number(bookId))
  if (!book) {
    const err = new Error('O livro informado nao existe')
    err.status = 422
    throw err
  }

  const normalizedPage = Number(currentPage) || 0
  if (normalizedPage < 0 || normalizedPage > book.pages) {
    const err = new Error('A pagina atual deve ficar entre 0 e o total de paginas do livro')
    err.status = 400
    throw err
  }

  if (status === 'finished' && normalizedPage !== book.pages) {
    const err = new Error('Para concluir a leitura, a pagina atual deve ser a ultima do livro')
    err.status = 400
    throw err
  }

  return {
    bookId: Number(bookId),
    status,
    currentPage: normalizedPage,
    startedAt: startedAt || null,
    finishedAt: finishedAt || null,
    notes: notes?.trim() || null,
  }
}
