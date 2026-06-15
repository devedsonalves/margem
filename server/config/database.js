import fs from 'node:fs/promises'
import path from 'node:path'
import sqlite3 from 'sqlite3'
import { open } from 'sqlite'

const defaultDatabasePath = path.resolve(process.cwd(), 'server', 'database', 'margem.sqlite')
const databasePath = path.resolve(process.env.SQLITE_DB_PATH || defaultDatabasePath)

let databasePromise

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = openDatabase()
  }

  return databasePromise
}

async function openDatabase() {
  await fs.mkdir(path.dirname(databasePath), { recursive: true })

  const database = await open({
    filename: databasePath,
    driver: sqlite3.Database,
  })

  await database.exec('PRAGMA foreign_keys = ON')
  await database.exec('PRAGMA journal_mode = WAL')

  return database
}

function normalizePlaceholders(text) {
  return text.replace(/\$\d+/g, '?')
}

function expectsRows(text) {
  return /^(SELECT|WITH|PRAGMA)\b/i.test(text.trim()) || /\bRETURNING\b/i.test(text)
}

function hasMultipleStatements(text) {
  const statements = text
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)

  return statements.length > 1
}

export async function query(text, params = []) {
  const database = await getDatabase()
  const sql = normalizePlaceholders(text)

  if (!params.length && hasMultipleStatements(sql)) {
    await database.exec(sql)
    return { rows: [], rowCount: 0 }
  }

  if (expectsRows(sql)) {
    const rows = await database.all(sql, params)
    return { rows, rowCount: rows.length }
  }

  const result = await database.run(sql, params)
  return { rows: [], rowCount: result.changes || 0, lastID: result.lastID }
}

export { databasePath }
