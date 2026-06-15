import { Router } from 'express'
import { readingTrackerController } from '../controllers/readingTrackerController.js'

const router = Router()

router.get('/', readingTrackerController.listAll)
router.get('/:id', readingTrackerController.findById)
router.post('/', readingTrackerController.create)
router.put('/:id', readingTrackerController.update)
router.delete('/:id', readingTrackerController.remove)

export default router
