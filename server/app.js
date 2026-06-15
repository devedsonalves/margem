import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authorsRouter from './routes/authors.js'
import publishersRouter from './routes/publishers.js'
import booksRouter from './routes/books.js'
import readingTrackersRouter from './routes/readingTrackers.js'
import { logger } from './middleware/logger.js'
import { errorHandler } from './middleware/errorHandler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const webPath = path.resolve(__dirname, '..', 'web')

const app = express()

app.use(cors())
app.use(express.json())
app.use(logger)

app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/authors', authorsRouter)
app.use('/publishers', publishersRouter)
app.use('/books', booksRouter)
app.use('/reading-trackers', readingTrackersRouter)

app.get('/api', (req, res) => {
  res.json({
    api: 'Margem API',
    versao: '1.0.0',
    descricao: 'Catalogo de livros com acompanhamento de leitura',
    rotas: ['/authors', '/publishers', '/books', '/reading-trackers', '/health'],
  })
})

app.use(express.static(webPath))

app.use(errorHandler)

export default app
