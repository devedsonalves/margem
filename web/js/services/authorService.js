import { api } from '../api.js'

export const authorService = {
  list() {
    return api.getAuthors()
  },

  create({ name, country, bio }) {
    if (!name?.trim()) throw new Error('O nome do autor e obrigatorio')

    return api.createAuthor({
      name: name.trim(),
      country: country?.trim() || null,
      bio: bio?.trim() || null,
    })
  },

  remove(id) {
    return api.removeAuthor(id)
  },
}
