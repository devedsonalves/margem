const form = document.querySelector('#form-tracker')
const list = document.querySelector('#list-trackers')
const count = document.querySelector('#count-trackers')

function renderTrackerCard(tracker, onSave, onRemove) {
  const article = document.createElement('article')
  article.className = 'card-item'
  article.innerHTML = `
    <header>
      <div>
        <h3>${tracker.book_title}</h3>
        <p class="muted mb-1">${tracker.author_name} • ${tracker.publisher_name}</p>
        <small class="muted">Pagina atual: ${tracker.current_page}/${tracker.book_pages}</small>
      </div>
      <span class="badge text-bg-warning">${tracker.status}</span>
    </header>
    <div class="row g-2 mt-2">
      <div class="col-md-4">
        <select class="form-select form-select-sm" data-field="status">
          <option value="backlog" ${tracker.status === 'backlog' ? 'selected' : ''}>Na fila</option>
          <option value="reading" ${tracker.status === 'reading' ? 'selected' : ''}>Lendo</option>
          <option value="finished" ${tracker.status === 'finished' ? 'selected' : ''}>Concluido</option>
        </select>
      </div>
      <div class="col-md-3">
        <input class="form-control form-control-sm" data-field="currentPage" type="number" min="0" value="${tracker.current_page}" />
      </div>
      <div class="col-md-5">
        <input class="form-control form-control-sm" data-field="notes" type="text" value="${tracker.notes || ''}" placeholder="Observacoes" />
      </div>
    </div>
    <div class="actions">
      <button class="btn btn-sm btn-outline-light" data-action="save" type="button">Salvar</button>
      <button class="btn btn-sm btn-outline-danger" data-action="remove" type="button">Remover</button>
    </div>
  `

  article.querySelector('[data-action="save"]').addEventListener('click', () => {
    onSave(tracker.id, {
      bookId: tracker.book_id,
      status: article.querySelector('[data-field="status"]').value,
      currentPage: article.querySelector('[data-field="currentPage"]').value,
      startedAt: tracker.started_at,
      finishedAt: tracker.finished_at,
      notes: article.querySelector('[data-field="notes"]').value,
    })
  })

  article.querySelector('[data-action="remove"]').addEventListener('click', () => {
    onRemove(tracker.id)
  })

  return article
}

export const readingTrackerView = {
  render(trackers, onSave, onRemove) {
    count.textContent = String(trackers.length)
    list.innerHTML = ''

    if (trackers.length === 0) {
      list.innerHTML = '<div class="empty-state">Nenhum acompanhamento cadastrado ainda.</div>'
      return
    }

    trackers.forEach((tracker) => list.appendChild(renderTrackerCard(tracker, onSave, onRemove)))
  },

  reset() {
    form.reset()
  },

  onSubmit(callback) {
    form.addEventListener('submit', (event) => {
      event.preventDefault()
      callback({
        bookId: document.querySelector('#tracker-book').value,
        status: document.querySelector('#tracker-status').value,
        currentPage: document.querySelector('#tracker-current-page').value,
        startedAt: document.querySelector('#tracker-started-at').value,
        finishedAt: document.querySelector('#tracker-finished-at').value,
        notes: document.querySelector('#tracker-notes').value,
      })
    })
  },
}
