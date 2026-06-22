import { API_URL } from './config.js'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    let message = `Erro ${response.status}`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {}
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}

export const api = {
  getAuthors() {
    return request('/authors')
  },
  createAuthor(dados) {
    return request('/authors', { method: 'POST', body: JSON.stringify(dados) })
  },
  removeAuthor(id) {
    return request(`/authors/${id}`, { method: 'DELETE' })
  },

  getPublishers() {
    return request('/publishers')
  },
  createPublisher(dados) {
    return request('/publishers', { method: 'POST', body: JSON.stringify(dados) })
  },
  removePublisher(id) {
    return request(`/publishers/${id}`, { method: 'DELETE' })
  },

  getBooks() {
    return request('/books')
  },
  createBook(dados) {
    return request('/books', { method: 'POST', body: JSON.stringify(dados) })
  },
  removeBook(id) {
    return request(`/books/${id}`, { method: 'DELETE' })
  },

  getReadingTrackers(bookId = '') {
    const suffix = bookId ? `?bookId=${bookId}` : ''
    return request(`/reading-trackers${suffix}`)
  },
  createReadingTracker(dados) {
    return request('/reading-trackers', { method: 'POST', body: JSON.stringify(dados) })
  },
  updateReadingTracker(id, dados) {
    return request(`/reading-trackers/${id}`, { method: 'PUT', body: JSON.stringify(dados) })
  },
  removeReadingTracker(id) {
    return request(`/reading-trackers/${id}`, { method: 'DELETE' })
  },
}
