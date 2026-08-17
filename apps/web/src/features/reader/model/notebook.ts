import type { NotebookDTO } from '@margem/types'

export type WritingDraft = {
  body: string
  title: string
}

export type NotebookContent = Record<string, unknown> & {
  writingDraft?: Partial<WritingDraft> & { updatedAt?: string }
}

export const emptyWritingDraft: WritingDraft = { body: '', title: '' }
export const notebookPageCharLimit = 520
export const notebookPageLineCount = 18
const notebookPageBreak = '\f'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function getNotebookContent(notebook: NotebookDTO | null): NotebookContent {
  return isRecord(notebook?.contentJson) ? notebook.contentJson : {}
}

export function getWritingDraft(notebook: NotebookDTO | null): WritingDraft {
  const draft = getNotebookContent(notebook).writingDraft

  return {
    body: typeof draft?.body === 'string' ? draft.body : '',
    title: typeof draft?.title === 'string' ? draft.title : ''
  }
}

export function paginateNotebookText(content: string) {
  const normalizedContent = content.replace(/\r\n/g, '\n')
  if (!normalizedContent) return ['']

  const pages: string[] = []
  const explicitPages = normalizedContent.split(notebookPageBreak)

  explicitPages.forEach(explicitPage => {
    let remainingText = explicitPage

    while (remainingText.length > notebookPageCharLimit) {
      const slice = remainingText.slice(0, notebookPageCharLimit)
      const breakIndex = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf(' '))
      const pageEnd = breakIndex > notebookPageCharLimit * 0.65 ? breakIndex : notebookPageCharLimit

      pages.push(remainingText.slice(0, pageEnd).trimEnd())
      remainingText = remainingText.slice(pageEnd).trimStart()
    }

    pages.push(remainingText)
  })

  return pages
}

export function joinNotebookPages(pages: string[]) {
  return pages.join(notebookPageBreak)
}

export function normalizeNotebookText(text: string) {
  return text.replace(/\s+/g, ' ').trim()
}

export function countWords(content: string) {
  return content.trim().match(/\S+/g)?.length ?? 0
}
