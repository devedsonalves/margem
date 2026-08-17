import type { HighlightArea, RenderHighlightTargetProps, RenderHighlightsProps } from '@react-pdf-viewer/highlight'
import { getHighlightColorClass } from '@/features/reader/model/highlightColors'

export function HighlightTarget({
  onSave,
  selectionRegion
}: RenderHighlightTargetProps & { onSave: () => Promise<void> }) {
  return (
    <div
      style={{
        left: `${selectionRegion.left}%`,
        top: `${selectionRegion.top + selectionRegion.height}%`
      }}
      className='absolute z-[9999] mt-2 -translate-x-1/2'
    >
      <button
        type='button'
        onClick={onSave}
        className='rounded-brand bg-[#091426] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_8px_24px_rgba(9,20,38,0.18)] transition hover:bg-[#17243a]'
      >
        Marcar texto
      </button>
    </div>
  )
}

export function SavedHighlights({
  areas,
  getCssProperties,
  isEraserMode,
  onDelete,
  pageIndex,
  rotation
}: RenderHighlightsProps & {
  areas: Array<{ highlightId: string; colorToken: string; area: HighlightArea }>
  isEraserMode: boolean
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <>
      {areas
        .filter(({ area }) => area.pageIndex === pageIndex)
        .map(({ area, colorToken, highlightId }, index) => (
          <div
            key={`${highlightId}-${index}`}
            className={[
              'absolute rounded-brand mix-blend-multiply',
              isEraserMode
                ? 'pointer-events-auto z-[20] cursor-cell ring-1 ring-[#991b1b]/50'
                : 'pointer-events-none z-[1]',
              getHighlightColorClass(colorToken, true)
            ].join(' ')}
            onClick={
              isEraserMode
                ? event => {
                    event.preventDefault()
                    event.stopPropagation()
                    void onDelete(highlightId)
                  }
                : undefined
            }
            onKeyDown={
              isEraserMode
                ? event => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    event.stopPropagation()
                    void onDelete(highlightId)
                  }
                : undefined
            }
            role={isEraserMode ? 'button' : undefined}
            style={getCssProperties(area, rotation)}
            tabIndex={isEraserMode ? 0 : undefined}
            title={isEraserMode ? 'Apagar marcação' : undefined}
          />
        ))}
    </>
  )
}
