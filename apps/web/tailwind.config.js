/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          main: '#F8F9FA',
          surface: '#FFFFFF'
        },
        text: {
          primary: '#1A2332',
          secondary: '#64748B'
        },
        border: {
          light: '#E2E8F0'
        },
        brand: {
          primary: '#FFE066',
          success: '#2ECC71',
          danger: '#EF4444'
        },
        highlight: {
          yellow: '#FFE066',
          green: '#A7F3D0',
          blue: '#BAE6FD',
          pink: '#FBCFE8'
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['var(--font-literata)', 'Literata', 'serif']
      },
      borderRadius: {
        brand: 'var(--radius-brand)'
      }
    }
  },
  plugins: []
}
