import { authorModel } from '../models/authorModel.js'

export const authorService = {
  listAll() {
    return authorModel.listAll()
  },

  async findById(id) {
    const author = await authorModel.findById(id)
    if (!author) {
      const err = new Error('Autor nao encontrado')
      err.status = 404
      throw err
    }
    return author
  },

  async create({ name, country, bio }) {
    if (!name?.trim()) {
      const err = new Error('O campo "name" e obrigatorio')
      err.status = 400
      throw err
    }

    return authorModel.create({
      name: name.trim(),
      country: country?.trim() || null,
      bio: bio?.trim() || null,
    })
  },

  async update(id, { name, country, bio }) {
    await this.findById(id)

    if (!name?.trim()) {
      const err = new Error('O campo "name" e obrigatorio')
      err.status = 400
      throw err
    }

    return authorModel.update(id, {
      name: name.trim(),
      country: country?.trim() || null,
      bio: bio?.trim() || null,
    })
  },

  async remove(id) {
    const removed = await authorModel.remove(id)
    if (!removed) {
      const err = new Error('Autor nao encontrado')
      err.status = 404
      throw err
    }
  },
}
