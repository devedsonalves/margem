import type { BoundingRect } from '@margem/types'
import type { HighlightArea } from '@react-pdf-viewer/highlight'

export function normalizeHighlightArea(area: BoundingRect, pageNumber: number): HighlightArea {
  return {
    height: area.height,
    left: area.left ?? area.x ?? 0,
    pageIndex: area.pageIndex ?? Math.max(pageNumber - 1, 0),
    top: area.top ?? area.y ?? 0,
    width: area.width
  }
}
