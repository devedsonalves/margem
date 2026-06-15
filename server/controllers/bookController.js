import { bookService } from '../services/bookService.js'

export const bookController = {
  async listAll(req, res) {
    res.json(
      await bookService.listAll({
        authorId: req.query.authorId ? Number(req.query.authorId) : null,
        publisherId: req.query.publisherId ? Number(req.query.publisherId) : null,
      }),
    )
  },

  async findById(req, res) {
    res.json(await bookService.findById(Number(req.params.id)))
  },

  async create(req, res) {
    res.status(201).json(await bookService.create(req.body))
  },

  async update(req, res) {
    res.json(await bookService.update(Number(req.params.id), req.body))
  },

  async remove(req, res) {
    await bookService.remove(Number(req.params.id))
    res.status(204).end()
  },
}
