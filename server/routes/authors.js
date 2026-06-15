import { Router } from 'express'
import { authorController } from '../controllers/authorController.js'

const router = Router()

router.get('/', authorController.listAll)
router.get('/:id', authorController.findById)
router.post('/', authorController.create)
router.put('/:id', authorController.update)
router.delete('/:id', authorController.remove)

export default router
