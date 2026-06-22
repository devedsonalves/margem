const form = document.querySelector('#form-book')
const list = document.querySelector('#list-books')
const count = document.querySelector('#count-books')
const authorSelect = document.querySelector('#book-author')
const publisherSelect = document.querySelector('#book-publisher')
const trackerBookSelect = document.querySelector('#tracker-book')
const filterBookSelect = document.querySelector('#filter-book')

export const bookView = {
  render(books, onRemove) {
    count.textContent = String(books.length)
    list.innerHTML = ''

    if (books.length === 0) {
      list.innerHTML = '<div class="empty-state">Nenhum livro cadastrado ainda.</div>'
      return
    }

    books.forEach((book) => {
      const article = document.createElement('article')
      article.className = 'card-item'
      article.innerHTML = `
        <header>
          <div>
            <h3>${book.title}</h3>
            <p class="muted mb-1">${book.genre} • ${book.pages} paginas • ISBN ${book.isbn}</p>
            <small class="muted">${book.author_name} • ${book.publisher_name}</small>
          </div>
          <span class="badge text-bg-light">#${book.id}</span>
        </header>
        <div class="actions">
          <button class="btn btn-sm btn-outline-danger" type="button">Remover</button>
        </div>
      `

      article.querySelector('button').addEventListener('click', () => onRemove(book.id))
      list.appendChild(article)
    })
  },

  fillDependencies(authors, publishers, books, selectedBookId = '') {
    authorSelect.innerHTML = '<option value="">Selecione um autor</option>'
    publisherSelect.innerHTML = '<option value="">Selecione uma editora</option>'
    trackerBookSelect.innerHTML = '<option value="">Selecione um livro</option>'
    filterBookSelect.innerHTML = '<option value="">Todos os livros</option>'

    authors.forEach((author) => {
      const option = document.createElement('option')
      option.value = author.id
      option.textContent = author.name
      authorSelect.appendChild(option)
    })

    publishers.forEach((publisher) => {
      const option = document.createElement('option')
      option.value = publisher.id
      option.textContent = publisher.name
      publisherSelect.appendChild(option)
    })

    books.forEach((book) => {
      const trackerOption = document.createElement('option')
      trackerOption.value = book.id
      trackerOption.textContent = book.title
      trackerBookSelect.appendChild(trackerOption)

      const filterOption = document.createElement('option')
      filterOption.value = book.id
      filterOption.textContent = book.title
      filterBookSelect.appendChild(filterOption)
    })

    filterBookSelect.value = selectedBookId
  },

  reset() {
    form.reset()
  },

  onSubmit(callback) {
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      callback({
        title: document.querySelector('#book-title').value,
        genre: document.querySelector('#book-genre').value,
        pages: document.querySelector('#book-pages').value,
        isbn: document.querySelector('#book-isbn').value,
        publicationYear: document.querySelector('#book-publication-year').value,
        authorId: authorSelect.value,
        publisherId: publisherSelect.value,
      })
    })
  },

  onFilterChange(callback) {
    filterBookSelect.addEventListener('change', (event) => callback(event.target.value))
  },
}
