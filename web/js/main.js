import { authorService } from './services/authorService.js'
import { publisherService } from './services/publisherService.js'
import { bookService } from './services/bookService.js'
import { readingTrackerService } from './services/readingTrackerService.js'
import { authorView } from './ui/authorView.js'
import { publisherView } from './ui/publisherView.js'
import { bookView } from './ui/bookView.js'
import { readingTrackerView } from './ui/readingTrackerView.js'
import { store } from './state/store.js'

const alerta = document.querySelector('#alerta')

function mostrarErro(message) {
  alerta.textContent = message
  alerta.classList.remove('d-none')
}

function limparErro() {
  alerta.classList.add('d-none')
  alerta.textContent = ''
}

async function loadAuthors() {
  store.authors = await authorService.list()
  authorView.render(store.authors, removeAuthor)
  bookView.fillDependencies(store.authors, store.publishers, store.books, store.filterBookId)
}

async function loadPublishers() {
  store.publishers = await publisherService.list()
  publisherView.render(store.publishers, removePublisher)
  bookView.fillDependencies(store.authors, store.publishers, store.books, store.filterBookId)
}

async function loadBooks() {
  store.books = await bookService.list()
  bookView.render(store.books, removeBook)
  bookView.fillDependencies(store.authors, store.publishers, store.books, store.filterBookId)
}

async function loadTrackers() {
  store.trackers = await readingTrackerService.list(store.filterBookId)
  readingTrackerView.render(store.trackers, updateTracker, removeTracker)
}

async function createAuthor(dados) {
  limparErro()
  try {
    await authorService.create(dados)
    authorView.reset()
    await loadAuthors()
  } catch (error) {
    mostrarErro(error.message)
  }
}

async function removeAuthor(id) {
  limparErro()
  try {
    await authorService.remove(id)
    await loadAuthors()
    await loadBooks()
    await loadTrackers()
  } catch (error) {
    mostrarErro(error.message)
  }
}

async function createPublisher(dados) {
  limparErro()
  try {
    await publisherService.create(dados)
    publisherView.reset()
    await loadPublishers()
  } catch (error) {
    mostrarErro(error.message)
  }
}

async function removePublisher(id) {
  limparErro()
  try {
    await publisherService.remove(id)
    await loadPublishers()
    await loadBooks()
    await loadTrackers()
  } catch (error) {
    mostrarErro(error.message)
  }
}

async function createBook(dados) {
  limparErro()
  try {
    await bookService.create(dados)
    bookView.reset()
    await loadBooks()
  } catch (error) {
    mostrarErro(error.message)
  }
}

async function removeBook(id) {
  limparErro()
  try {
    await bookService.remove(id)
    if (store.filterBookId === String(id)) {
      store.filterBookId = ''
    }
    await loadBooks()
    await loadTrackers()
  } catch (error) {
    mostrarErro(error.message)
  }
}

async function createTracker(dados) {
  limparErro()
  try {
    await readingTrackerService.create(dados)
    readingTrackerView.reset()
    await loadTrackers()
  } catch (error) {
    mostrarErro(error.message)
  }
}

async function updateTracker(id, dados) {
  limparErro()
  try {
    await readingTrackerService.update(id, dados)
    await loadTrackers()
  } catch (error) {
    mostrarErro(error.message)
  }
}

async function removeTracker(id) {
  limparErro()
  try {
    await readingTrackerService.remove(id)
    await loadTrackers()
  } catch (error) {
    mostrarErro(error.message)
  }
}

async function iniciar() {
  try {
    await loadAuthors()
    await loadPublishers()
    await loadBooks()
    await loadTrackers()
  } catch (error) {
    mostrarErro(
      'Nao foi possivel conectar com a API. Verifique se o backend e o SQLite estao disponiveis.',
    )
  }
}

authorView.onSubmit(createAuthor)
publisherView.onSubmit(createPublisher)
bookView.onSubmit(createBook)
readingTrackerView.onSubmit(createTracker)
bookView.onFilterChange(async (bookId) => {
  store.filterBookId = bookId
  await loadTrackers()
})

iniciar()
