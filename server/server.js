import app from './app.js'
import { initializeDatabase } from './database/init.js'

const PORT = process.env.PORT || 3000

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Margem API rodando em http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('Erro ao iniciar banco de dados:')
    console.error(error)
    process.exit(1)
  })
