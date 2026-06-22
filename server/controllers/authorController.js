import { authorService } from '../services/authorService.js'

export const authorController = {
  async listAll(req, res) {
    res.json(await authorService.listAll())
  },

  async findById(req, res) {
    res.json(await authorService.findById(Number(req.params.id)))
  },

  async create(req, res) {
    res.status(201).json(await authorService.create(req.body))
  },

  async update(req, res) {
    res.json(await authorService.update(Number(req.params.id), req.body))
  },

  async remove(req, res) {
    await authorService.remove(Number(req.params.id))
    res.status(204).end()
  },
}
