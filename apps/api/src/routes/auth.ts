import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/auth'
import { cancelUserBilling } from '../services/billingCancellation'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *         name:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: User already exists
 *       500:
 *         description: Internal server error
 */
router.post('/register', async (req, res) => {
  const { email, name, password } = req.body

  try {
    const userExists = await prisma.user.findUnique({ where: { email } })
    if (userExists) return res.status(400).json({ error: 'User already exists' })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, name, password: hashedPassword }
    })

    const token = createToken(user.id, user.email)

    const { password: _, ...userWithoutPassword } = user
    res.json({ user: serializeUser(userWithoutPassword), token })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(400).json({ error: 'Invalid credentials' })

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) return res.status(400).json({ error: 'Invalid credentials' })

    const token = createToken(user.id, user.email)

    const { password: _, ...userWithoutPassword } = user
    res.json({ user: serializeUser(userWithoutPassword), token })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) return res.status(404).json({ error: 'Conta não encontrada' })

    const { password: _, ...userWithoutPassword } = user
    return res.json({ user: serializeUser(userWithoutPassword) })
  } catch (error) {
    return res.status(500).json({ error: 'Não foi possível carregar a conta' })
  }
})

router.patch('/me', authMiddleware, async (req: AuthRequest, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : ''

  if (name.length < 2) {
    return res.status(400).json({ error: 'Informe um nome com pelo menos 2 caracteres' })
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido' })
  }

  try {
    const emailOwner = await prisma.user.findUnique({ where: { email } })
    if (emailOwner && emailOwner.id !== req.user!.id) {
      return res.status(409).json({ error: 'Este e-mail já está em uso' })
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { email, name }
    })
    const token = createToken(user.id, user.email)
    const { password: _, ...userWithoutPassword } = user

    return res.json({ user: serializeUser(userWithoutPassword), token })
  } catch (error) {
    return res.status(500).json({ error: 'Não foi possível atualizar o perfil' })
  }
})

router.patch('/password', authMiddleware, async (req: AuthRequest, res) => {
  const currentPassword = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : ''
  const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : ''

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'A nova senha deve ter pelo menos 8 caracteres' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) return res.status(404).json({ error: 'Conta não encontrada' })

    const passwordMatches = await bcrypt.compare(currentPassword, user.password)
    if (!passwordMatches) return res.status(400).json({ error: 'A senha atual está incorreta' })

    const repeatsCurrentPassword = await bcrypt.compare(newPassword, user.password)
    if (repeatsCurrentPassword) {
      return res.status(400).json({ error: 'A nova senha deve ser diferente da senha atual' })
    }

    const password = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({ where: { id: user.id }, data: { password } })

    return res.json({ message: 'Senha atualizada com sucesso' })
  } catch (error) {
    return res.status(500).json({ error: 'Não foi possível atualizar a senha' })
  }
})

router.get('/export', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const [user, documents, notebooks] = await Promise.all([
      prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          name: true,
          created_at: true,
          current_plan: true,
          plan_status: true,
          plan_activated_at: true,
          plan_expires_at: true
        }
      }),
      prisma.document.findMany({
        where: { user_id: req.user!.id },
        select: {
          id: true,
          title: true,
          file_size: true,
          total_pages: true,
          current_page: true,
          created_at: true,
          highlights: {
            select: {
              id: true,
              page_number: true,
              text_content: true,
              color_token: true,
              bounding_rects: true,
              created_at: true,
              margin_notes: {
                select: {
                  id: true,
                  comment_text: true,
                  updated_at: true
                }
              }
            }
          }
        }
      }),
      prisma.notebook.findMany({
        where: { user_id: req.user!.id },
        select: {
          id: true,
          document_id: true,
          content_json: true,
          updated_at: true
        }
      })
    ])

    if (!user) return res.status(404).json({ error: 'Conta não encontrada' })

    return res.json({
      exportedAt: new Date().toISOString(),
      profile: user,
      documents,
      notebooks
    })
  } catch (error) {
    return res.status(500).json({ error: 'Não foi possível exportar seus dados' })
  }
})

router.delete('/me', authMiddleware, async (req: AuthRequest, res) => {
  const password = typeof req.body.password === 'string' ? req.body.password : ''

  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } })
    if (!user) return res.status(404).json({ error: 'Conta não encontrada' })

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) return res.status(400).json({ error: 'A senha está incorreta' })

    await cancelUserBilling(user.id)

    await prisma.$transaction(async transaction => {
      await transaction.notebook.deleteMany({ where: { user_id: user.id } })
      await transaction.document.deleteMany({ where: { user_id: user.id } })
      await transaction.user.delete({ where: { id: user.id } })
    })

    return res.json({ message: 'Conta excluída com sucesso' })
  } catch (error) {
    return res.status(502).json({
      error: error instanceof Error ? error.message : 'Não foi possível excluir a conta'
    })
  }
})

export default router

function createToken(id: string, email: string) {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' })
}

function serializeUser(user: {
  id: string
  email: string
  name: string | null
  created_at: Date
  current_plan?: string
  plan_status?: string
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    created_at: user.created_at,
    currentPlan: user.current_plan || 'FREE',
    planStatus: user.plan_status || 'FREE'
  }
}
