import { api } from '../api.js'

export const publisherService = {
  list() {
    return api.getPublishers()
  },

  create({ name, headquarters, foundedYear }) {
    if (!name?.trim()) throw new Error('O nome da editora e obrigatorio')

    return api.createPublisher({
      name: name.trim(),
      headquarters: headquarters?.trim() || null,
      foundedYear: foundedYear ? Number(foundedYear) : null,
    })
  },

  remove(id) {
    return api.removePublisher(id)
  },
}
