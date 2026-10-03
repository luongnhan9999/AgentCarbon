/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        climate: {
          slate: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
          forest: '#059669',
          forestLight: '#10B981',
          cyan: '#0284C7',
          crimson: '#E11D48',
          amber: '#D97706',
        }
      },
      fontFamily: {
        space: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
