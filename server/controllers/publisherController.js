import { publisherService } from '../services/publisherService.js'

export const publisherController = {
  async listAll(req, res) {
    res.json(await publisherService.listAll())
  },

  async findById(req, res) {
    res.json(await publisherService.findById(Number(req.params.id)))
  },

  async create(req, res) {
    res.status(201).json(await publisherService.create(req.body))
  },

  async update(req, res) {
    res.json(await publisherService.update(Number(req.params.id), req.body))
  },

  async remove(req, res) {
    await publisherService.remove(Number(req.params.id))
    res.status(204).end()
  },
}
