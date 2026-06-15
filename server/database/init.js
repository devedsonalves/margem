import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { query } from '../config/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = await fs.readFile(schemaPath, 'utf8')
  await query(schema)
}
