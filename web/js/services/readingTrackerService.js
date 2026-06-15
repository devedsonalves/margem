import { api } from '../api.js'

const VALID_STATUS = ['backlog', 'reading', 'finished']

export const readingTrackerService = {
  list(bookId) {
    return api.getReadingTrackers(bookId)
  },

  create({ bookId, status, currentPage, startedAt, finishedAt, notes }) {
    if (!bookId) throw new Error('Selecione um livro')
    if (!VALID_STATUS.includes(status)) throw new Error('Status do acompanhamento invalido')

    return api.createReadingTracker({
      bookId: Number(bookId),
      status,
      currentPage: Number(currentPage) || 0,
      startedAt: startedAt || null,
      finishedAt: finishedAt || null,
      notes: notes?.trim() || null,
    })
  },

  update(id, { bookId, status, currentPage, startedAt, finishedAt, notes }) {
    if (!bookId) throw new Error('Selecione um livro')
    if (!VALID_STATUS.includes(status)) throw new Error('Status do acompanhamento invalido')

    return api.updateReadingTracker(id, {
      bookId: Number(bookId),
      status,
      currentPage: Number(currentPage) || 0,
      startedAt: startedAt || null,
      finishedAt: finishedAt || null,
      notes: notes?.trim() || null,
    })
  },

  remove(id) {
    return api.removeReadingTracker(id)
  },
}
