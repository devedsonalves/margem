import { Inter, Literata } from 'next/font/google'
import { AuthProvider } from '@/features/auth/AuthProvider'

import '@/styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

const literata = Literata({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-literata'
})

export const metadata = {
  title: 'Margem - Ambiente de leitura',
  description: 'Transforme sua leitura em conhecimento estruturado.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='pt-BR' className={`${inter.variable} ${literata.variable}`}>
      <body className='antialiased font-sans bg-bg-main text-text-primary'>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
