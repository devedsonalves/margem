import { Router } from 'express'
import { publisherController } from '../controllers/publisherController.js'

const router = Router()

router.get('/', publisherController.listAll)
router.get('/:id', publisherController.findById)
router.post('/', publisherController.create)
router.put('/:id', publisherController.update)
router.delete('/:id', publisherController.remove)

export default router
