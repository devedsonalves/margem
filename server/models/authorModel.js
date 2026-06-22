import { query } from '../config/database.js'
import { BaseModel } from './baseModel.js'

class PersonModel extends BaseModel {
  async listAll() {
    const result = await query(`SELECT * FROM ${this.tableName} ORDER BY id`)
    return result.rows
  }

  async findById(id) {
    const result = await query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id])
    return result.rows[0] || null
  }
}

class AuthorModel extends PersonModel {
  constructor() {
    super('authors')
  }

  async create({ name, country, bio }) {
    const result = await query(
      `
        INSERT INTO authors (name, country, bio)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [name, country, bio],
    )

    return result.rows[0]
  }

  async update(id, { name, country, bio }) {
    const result = await query(
      `
        UPDATE authors
        SET name = $1, country = $2, bio = $3
        WHERE id = $4
        RETURNING *
      `,
      [name, country, bio, id],
    )

    return result.rows[0] || null
  }

  async remove(id) {
    const result = await query('DELETE FROM authors WHERE id = $1', [id])
    return result.rowCount > 0
  }
}

export const authorModel = new AuthorModel()
