const form = document.querySelector('#form-publisher')
const list = document.querySelector('#list-publishers')
const count = document.querySelector('#count-publishers')

function createCard(publisher, onRemove) {
  const article = document.createElement('article')
  article.className = 'card-item'
  article.innerHTML = `
    <header>
      <div>
        <h3>${publisher.name}</h3>
        <p class="muted mb-1">${publisher.headquarters || 'Sede nao informada'}</p>
        <small class="muted">Fundacao: ${publisher.founded_year || 'n/d'}</small>
      </div>
      <span class="badge text-bg-light">#${publisher.id}</span>
    </header>
    <div class="actions">
      <button class="btn btn-sm btn-outline-danger" type="button">Remover</button>
    </div>
  `

  article.querySelector('button').addEventListener('click', () => onRemove(publisher.id))
  return article
}

export const publisherView = {
  render(publishers, onRemove) {
    count.textContent = String(publishers.length)
    list.innerHTML = ''

    if (publishers.length === 0) {
      list.innerHTML = '<div class="empty-state">Nenhuma editora cadastrada ainda.</div>'
      return
    }

    publishers.forEach((publisher) => list.appendChild(createCard(publisher, onRemove)))
  },

  reset() {
    form.reset()
  },

  onSubmit(callback) {
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      callback({
        name: document.querySelector('#publisher-name').value,
        headquarters: document.querySelector('#publisher-headquarters').value,
        foundedYear: document.querySelector('#publisher-founded-year').value,
      })
    })
  },
}
