import type { HighlightColorToken } from '@/features/reader/model/reader'

export const highlightColors: Array<{
  token: HighlightColorToken
  label: string
  className: string
}> = [
  { token: 'highlight-yellow', label: 'Amarelo', className: 'bg-[#FFE066]' },
  { token: 'highlight-green', label: 'Verde', className: 'bg-[#A7F3D0]' },
  { token: 'highlight-blue', label: 'Azul', className: 'bg-[#BAE6FD]' },
  { token: 'highlight-pink', label: 'Rosa', className: 'bg-[#FBCFE8]' }
]

export function getHighlightColorClass(colorToken: string, translucent = false) {
  switch (colorToken) {
    case 'highlight-green':
      return translucent ? 'bg-[#A7F3D0]/70' : 'bg-[#A7F3D0]'
    case 'highlight-blue':
      return translucent ? 'bg-[#BAE6FD]/70' : 'bg-[#BAE6FD]'
    case 'highlight-pink':
      return translucent ? 'bg-[#FBCFE8]/70' : 'bg-[#FBCFE8]'
    default:
      return translucent ? 'bg-[#FFE066]/70' : 'bg-[#FFE066]'
  }
}
