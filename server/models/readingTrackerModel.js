import { query } from '../config/database.js'
import { BaseModel } from './baseModel.js'

class TrackerModel extends BaseModel {
  constructor() {
    super('reading_trackers')
  }

  async listAll(bookId) {
    const values = []
    let whereClause = ''

    if (bookId) {
      values.push(bookId)
      whereClause = `WHERE rt.book_id = $1`
    }

    const result = await query(
      `
        SELECT
          rt.*,
          b.title AS book_title,
          b.pages AS book_pages,
          a.name AS author_name,
          p.name AS publisher_name
        FROM reading_trackers rt
        JOIN books b ON b.id = rt.book_id
        JOIN authors a ON a.id = b.author_id
        JOIN publishers p ON p.id = b.publisher_id
        ${whereClause}
        ORDER BY rt.id
      `,
      values,
    )

    return result.rows
  }

  async findById(id) {
    const result = await query(
      `
        SELECT
          rt.*,
          b.title AS book_title,
          b.pages AS book_pages,
          a.name AS author_name,
          p.name AS publisher_name
        FROM reading_trackers rt
        JOIN books b ON b.id = rt.book_id
        JOIN authors a ON a.id = b.author_id
        JOIN publishers p ON p.id = b.publisher_id
        WHERE rt.id = $1
      `,
      [id],
    )

    return result.rows[0] || null
  }

  async create({ bookId, status, currentPage, startedAt, finishedAt, notes }) {
    const result = await query(
      `
        INSERT INTO reading_trackers (book_id, status, current_page, started_at, finished_at, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [bookId, status, currentPage, startedAt, finishedAt, notes],
    )

    return this.findById(result.rows[0].id)
  }

  async update(id, { bookId, status, currentPage, startedAt, finishedAt, notes }) {
    const result = await query(
      `
        UPDATE reading_trackers
        SET book_id = $1,
            status = $2,
            current_page = $3,
            started_at = $4,
            finished_at = $5,
            notes = $6
        WHERE id = $7
        RETURNING *
      `,
      [bookId, status, currentPage, startedAt, finishedAt, notes, id],
    )

    if (result.rowCount === 0) return null
    return this.findById(id)
  }

  async remove(id) {
    const result = await query('DELETE FROM reading_trackers WHERE id = $1', [id])
    return result.rowCount > 0
  }
}

export const readingTrackerModel = new TrackerModel()
