import { Router } from 'express'
import { bookController } from '../controllers/bookController.js'

const router = Router()

router.get('/', bookController.listAll)
router.get('/:id', bookController.findById)
router.post('/', bookController.create)
router.put('/:id', bookController.update)
router.delete('/:id', bookController.remove)

export default router
