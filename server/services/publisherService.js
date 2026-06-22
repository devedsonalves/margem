import { publisherModel } from '../models/publisherModel.js'

export const publisherService = {
  listAll() {
    return publisherModel.listAll()
  },

  async findById(id) {
    const publisher = await publisherModel.findById(id)
    if (!publisher) {
      const err = new Error('Editora nao encontrada')
      err.status = 404
      throw err
    }
    return publisher
  },

  async create({ name, headquarters, foundedYear }) {
    if (!name?.trim()) {
      const err = new Error('O campo "name" e obrigatorio')
      err.status = 400
      throw err
    }

    const existing = await publisherModel.findByName(name.trim())
    if (existing) {
      const err = new Error('Ja existe uma editora com esse nome')
      err.status = 409
      throw err
    }

    return publisherModel.create({
      name: name.trim(),
      headquarters: headquarters?.trim() || null,
      foundedYear: foundedYear ? Number(foundedYear) : null,
    })
  },

  async update(id, { name, headquarters, foundedYear }) {
    await this.findById(id)

    if (!name?.trim()) {
      const err = new Error('O campo "name" e obrigatorio')
      err.status = 400
      throw err
    }

    const existing = await publisherModel.findByName(name.trim())
    if (existing && existing.id !== id) {
      const err = new Error('Ja existe uma editora com esse nome')
      err.status = 409
      throw err
    }

    return publisherModel.update(id, {
      name: name.trim(),
      headquarters: headquarters?.trim() || null,
      foundedYear: foundedYear ? Number(foundedYear) : null,
    })
  },

  async remove(id) {
    const removed = await publisherModel.remove(id)
    if (!removed) {
      const err = new Error('Editora nao encontrada')
      err.status = 404
      throw err
    }
  },
}
