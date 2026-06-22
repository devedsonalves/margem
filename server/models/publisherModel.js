import { query } from '../config/database.js'
import { BaseModel } from './baseModel.js'

class OrganizationModel extends BaseModel {
  async listAll() {
    const result = await query(`SELECT * FROM ${this.tableName} ORDER BY id`)
    return result.rows
  }

  async findById(id) {
    const result = await query(`SELECT * FROM ${this.tableName} WHERE id = $1`, [id])
    return result.rows[0] || null
  }
}

class PublisherModel extends OrganizationModel {
  constructor() {
    super('publishers')
  }

  async findByName(name) {
    const result = await query('SELECT * FROM publishers WHERE LOWER(name) = LOWER($1)', [
      name,
    ])
    return result.rows[0] || null
  }

  async create({ name, headquarters, foundedYear }) {
    const result = await query(
      `
        INSERT INTO publishers (name, headquarters, founded_year)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [name, headquarters, foundedYear],
    )

    return result.rows[0]
  }

  async update(id, { name, headquarters, foundedYear }) {
    const result = await query(
      `
        UPDATE publishers
        SET name = $1, headquarters = $2, founded_year = $3
        WHERE id = $4
        RETURNING *
      `,
      [name, headquarters, foundedYear, id],
    )

    return result.rows[0] || null
  }

  async remove(id) {
    const result = await query('DELETE FROM publishers WHERE id = $1', [id])
    return result.rowCount > 0
  }
}

export const publisherModel = new PublisherModel()
