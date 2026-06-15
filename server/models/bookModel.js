import { query } from '../config/database.js'
import { BaseModel } from './baseModel.js'

class LibraryItemModel extends BaseModel {
  async listAll(filters = {}) {
    const clauses = []
    const values = []

    if (filters.authorId) {
      values.push(filters.authorId)
      clauses.push(`b.author_id = $${values.length}`)
    }

    if (filters.publisherId) {
      values.push(filters.publisherId)
      clauses.push(`b.publisher_id = $${values.length}`)
    }

    const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : ''
    const result = await query(
      `
        SELECT
          b.*,
          a.name AS author_name,
          p.name AS publisher_name
        FROM books b
        JOIN authors a ON a.id = b.author_id
        JOIN publishers p ON p.id = b.publisher_id
        ${whereClause}
        ORDER BY b.id
      `,
      values,
    )

    return result.rows
  }

  async findById(id) {
    const result = await query(
      `
        SELECT
          b.*,
          a.name AS author_name,
          p.name AS publisher_name
        FROM books b
        JOIN authors a ON a.id = b.author_id
        JOIN publishers p ON p.id = b.publisher_id
        WHERE b.id = $1
      `,
      [id],
    )

    return result.rows[0] || null
  }
}

class BookModel extends LibraryItemModel {
  constructor() {
    super('books')
  }

  async findByIsbn(isbn) {
    const result = await query('SELECT * FROM books WHERE isbn = $1', [isbn])
    return result.rows[0] || null
  }

  async create({ title, genre, pages, isbn, publicationYear, authorId, publisherId }) {
    const result = await query(
      `
        INSERT INTO books (title, genre, pages, isbn, publication_year, author_id, publisher_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `,
      [title, genre, pages, isbn, publicationYear, authorId, publisherId],
    )

    return this.findById(result.rows[0].id)
  }

  async update(id, { title, genre, pages, isbn, publicationYear, authorId, publisherId }) {
    const result = await query(
      `
        UPDATE books
        SET title = $1,
            genre = $2,
            pages = $3,
            isbn = $4,
            publication_year = $5,
            author_id = $6,
            publisher_id = $7
        WHERE id = $8
        RETURNING *
      `,
      [title, genre, pages, isbn, publicationYear, authorId, publisherId, id],
    )

    if (result.rowCount === 0) return null
    return this.findById(id)
  }

  async remove(id) {
    const result = await query('DELETE FROM books WHERE id = $1', [id])
    return result.rowCount > 0
  }
}

export const bookModel = new BookModel()
