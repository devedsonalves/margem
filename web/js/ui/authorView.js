const form = document.querySelector('#form-author')
const list = document.querySelector('#list-authors')
const count = document.querySelector('#count-authors')

function createCard(author, onRemove) {
  const article = document.createElement('article')
  article.className = 'card-item'
  article.innerHTML = `
    <header>
      <div>
        <h3>${author.name}</h3>
        <p class="muted mb-1">${author.country || 'Pais nao informado'}</p>
        <small class="muted">${author.bio || 'Biografia nao informada.'}</small>
      </div>
      <span class="badge text-bg-light">#${author.id}</span>
    </header>
    <div class="actions">
      <button class="btn btn-sm btn-outline-danger" type="button">Remover</button>
    </div>
  `

  article.querySelector('button').addEventListener('click', () => onRemove(author.id))
  return article
}

export const authorView = {
  render(authors, onRemove) {
    count.textContent = String(authors.length)
    list.innerHTML = ''

    if (authors.length === 0) {
      list.innerHTML = '<div class="empty-state">Nenhum autor cadastrado ainda.</div>'
      return
    }

    authors.forEach((author) => list.appendChild(createCard(author, onRemove)))
  },

  reset() {
    form.reset()
  },

  onSubmit(callback) {
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      callback({
        name: document.querySelector('#author-name').value,
        country: document.querySelector('#author-country').value,
        bio: document.querySelector('#author-bio').value,
      })
    })
  },
}
