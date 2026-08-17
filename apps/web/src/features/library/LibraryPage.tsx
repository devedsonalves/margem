'use client'

import { AppShell } from '@/features/shell/components/AppShell'
import { LibraryCollection } from '@/features/library/components/LibraryCollection'
import { LibraryHeader } from '@/features/library/components/LibraryHeader'
import type { LibraryItem } from '@/features/library/model/libraryItem'
import { useLibrary } from '@/features/library/useLibrary'

export default function LibraryPage() {
  const library = useLibrary()

  const handleDelete = async (item: LibraryItem) => {
    if (!window.confirm(`Excluir "${item.title}" do seu acervo?`)) return

    try {
      await library.removeDocument(item.id)
    } catch (error) {
      console.error('Failed to delete document', error)
      alert('Falha ao excluir o documento')
    }
  }

  return (
    <AppShell
      activeItem='acervo'
      uploading={library.uploading}
      onLogout={library.logout}
      onUpload={library.uploadDocument}
    >
      {openUpload => (
        <section className='flex w-full flex-col gap-8'>
          <LibraryHeader
            documentCount={library.documentCount}
            loading={library.loading}
            query={library.query}
            viewMode={library.viewMode}
            onQueryChange={library.setQuery}
            onViewModeChange={library.setViewMode}
          />
          <LibraryCollection
            deletingDocumentId={library.deletingDocumentId}
            items={library.items}
            loading={library.loading}
            viewMode={library.viewMode}
            onDelete={handleDelete}
            onUpload={openUpload}
          />
        </section>
      )}
    </AppShell>
  )
}
