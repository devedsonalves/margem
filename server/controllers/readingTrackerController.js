import { readingTrackerService } from '../services/readingTrackerService.js'

export const readingTrackerController = {
  async listAll(req, res) {
    res.json(await readingTrackerService.listAll(req.query.bookId))
  },

  async findById(req, res) {
    res.json(await readingTrackerService.findById(Number(req.params.id)))
  },

  async create(req, res) {
    res.status(201).json(await readingTrackerService.create(req.body))
  },

  async update(req, res) {
    res.json(await readingTrackerService.update(Number(req.params.id), req.body))
  },

  async remove(req, res) {
    await readingTrackerService.remove(Number(req.params.id))
    res.status(204).end()
  },
}
